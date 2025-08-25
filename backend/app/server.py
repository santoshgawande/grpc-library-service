import grpc
import datetime
from db.db import BorrowingModel
from db.db import MemberModel
from db.db import SessionLocal, BookModel
from proto import library_pb2_grpc
from proto import library_pb2
from concurrent import futures


class LibraryService(library_pb2_grpc.LibraryServiceServicer):
    def DeleteMember(self, request, context):
        session = SessionLocal()
        member = session.query(MemberModel).filter(
            MemberModel.id == request.id).first()
        if not member:
            session.close()
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Member not found")
            return library_pb2.Empty()
        session.delete(member)
        session.commit()
        session.close()
        return library_pb2.Empty()

    def UpdateMember(self, request, context):
        session = SessionLocal()
        member = session.query(MemberModel).filter(
            MemberModel.id == request.id).first()
        if not member:
            session.close()
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Member not found")
            return library_pb2.Member()

        updated = False
        if request.name is not None and request.name != member.name:
            member.name = request.name
            updated = True
        if request.email is not None and request.email != member.email:
            member.email = request.email
            updated = True
        if hasattr(request, 'phone') and request.phone is not None and request.phone != getattr(member, 'phone', None):
            member.phone = request.phone
            updated = True

        if updated:
            session.commit()
            session.refresh(member)
        session.close()
        return library_pb2.Member(
            id=member.id,
            name=member.name,
            email=member.email,
            phone=getattr(member, 'phone', "")
        )

    def ListMembers(self, request, context):
        session = SessionLocal()
        members = session.query(MemberModel).all()
        member_messages = []
        for member in members:
            member_messages.append(
                library_pb2.Member(
                    id=member.id,
                    name=member.name,
                    email=member.email,
                    phone=getattr(member, 'phone', "")
                )
            )
        session.close()
        return library_pb2.MemberList(members=member_messages)

    def AddMember(self, request, context):
        session = SessionLocal()
        new_member = MemberModel(
            name=request.name,
            email=request.email,
            phone=getattr(request, 'phone', None)
        )
        session.add(new_member)
        session.commit()
        session.refresh(new_member)
        response = library_pb2.Member(
            id=new_member.id,
            name=new_member.name,
            email=new_member.email,
            phone=getattr(new_member, 'phone', "")
        )
        session.close()
        return response

    def ListBorrowings(self, request, context):
        session = SessionLocal()
        borrowings = session.query(BorrowingModel).all()
        borrowing_messages = []
        now = datetime.datetime.now(datetime.timezone.utc)
        fine_per_day = 1.0  # You can make this configurable if needed
        for b in borrowings:
            # Calculate fine for overdue and not yet returned
            fine = b.fine or 0.0
            if b.returned_at is None and b.due_at is not None and now > b.due_at:
                days_late = (now - b.due_at).days
                fine = days_late * fine_per_day
            borrowing_messages.append(
                library_pb2.Borrowing(
                    id=int(b.id) if b.id is not None else 0,
                    book_id=int(b.book_id) if b.book_id is not None else 0,
                    member_id=int(
                        b.member_id) if b.member_id is not None else 0,
                    borrow_date=str(b.borrowed_at) if b.borrowed_at else "",
                    due_date=str(b.due_at) if hasattr(
                        b, 'due_at') and b.due_at else "",
                    return_date=str(b.returned_at) if b.returned_at else "",
                    fine=fine
                )
            )
        session.close()
        return library_pb2.BorrowingList(borrowings=borrowing_messages)

    def BorrowBook(self, request, context):
        session = SessionLocal()
        # Optionally, check if book exists and is available
        book = session.query(BookModel).filter(
            BookModel.id == request.book_id).first()
        if not book or book.copies_available < 1:
            session.close()
            context.set_code(grpc.StatusCode.FAILED_PRECONDITION)
            context.set_details("Book not available")
            return library_pb2.Borrowing()

        # Decrement available copies, but do not allow negative values
        if book.copies_available > 0:
            book.copies_available -= 1
        if book.copies_available < 0:
            book.copies_available = 0
        borrowed_at = datetime.datetime.now(datetime.timezone.utc)
        # Flexible due_at: use request.due_days if provided, else default to 7 days
        due_days = getattr(request, 'due_days', 7) or 7
        due_at_dt = datetime.datetime.now(
            datetime.timezone.utc) + datetime.timedelta(days=due_days)
        due_at = due_at_dt
        borrowing = BorrowingModel(
            book_id=request.book_id,
            member_id=request.member_id,
            borrowed_at=borrowed_at,
            due_at=due_at,
            returned_at=None
        )
        session.add(borrowing)
        session.commit()
        session.refresh(borrowing)
        session.commit()
        response = library_pb2.Borrowing(
            id=int(borrowing.id) if borrowing.id is not None else 0,
            book_id=int(
                borrowing.book_id) if borrowing.book_id is not None else 0,
            member_id=int(
                borrowing.member_id) if borrowing.member_id is not None else 0,
            borrow_date=str(
                borrowing.borrowed_at) if borrowing.borrowed_at else "",
            due_date=str(borrowing.due_at) if hasattr(
                borrowing, 'due_at') and borrowing.due_at else "",
            return_date=str(
                borrowing.returned_at) if borrowing.returned_at else ""
        )
        session.close()
        return response

    def GetBook(self, request, context):

        session = SessionLocal()
        book = session.query(BookModel).filter(
            BookModel.id == request.id).first()
        session.close()
        print("Book :", book)

        if book:
            return library_pb2.Book(
                id=book.id,
                title=book.title,
                author=book.author,
                isbn=book.isbn,
                copies_total=book.copies_total,
                copies_available=book.copies_available
            )
        else:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Book not found")
            return library_pb2.Book()

    def ListBooks(self, request, context):

        session = SessionLocal()
        books = session.query(BookModel)
        book_messages = []
        if books.count() == 0:
            print("No books found in the database.")
        else:
            for book in books:
                book_messages.append(
                    library_pb2.Book(
                        id=book.id,
                        title=book.title,
                        author=book.author,
                        isbn=book.isbn,
                        copies_total=book.copies_total,
                        copies_available=book.copies_available
                    )
                )

        if not book_messages:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("No books found")
        session.close()
        return library_pb2.BookList(books=book_messages)

    def AddBook(self, request, context):
        print("AddBook method called with:", request)

        session = SessionLocal()

        new_book = BookModel(
            title=request.title,
            author=request.author,
            isbn=request.isbn,
            copies_total=int(request.copies_total or 0),
            copies_available=int(request.copies_available or 0)
        )

        session.add(new_book)
        session.commit()
        session.refresh(new_book)
        session.close()

        return library_pb2.Book(
            id=new_book.id,
            title=new_book.title,
            author=new_book.author,
            isbn=new_book.isbn,
            copies_total=int(new_book.copies_total),
            copies_available=int(new_book.copies_available)
        )

    def PartialUpdateBook(self, request, context):
        print("PartialUpdateBook method called, ")
        print("request:", request)

        print("request.id :", request.id, type(request.id))
        print("request.copies_total:", request.copies_total,
              type(request.copies_total))
        print("request.copies_available:", request.copies_available,
              type(request.copies_available))

        session = SessionLocal()

        book = session.query(BookModel).filter(
            BookModel.id == request.id
        ).first()

        # print("Book fetched from DB:")
        # print("book.title:", book.title)
        # print("book.author:", book.author)
        # print("book.isbn:", book.isbn)
        # print("book.copies_total:", book.copies_total)
        # print("book.copies_available:", book.copies_available)

        if book:
            # PATCH-style: only update fields present in request and different from DB
            updated = False
            if request.title is not None and request.title != book.title:
                book.title = request.title
                updated = True
            if request.author is not None and request.author != book.author:
                book.author = request.author
                updated = True
            if request.isbn is not None and request.isbn != book.isbn:
                book.isbn = request.isbn
                updated = True

            if request.copies_total is not None and request.copies_total != book.copies_total:
                book.copies_total = int(request.copies_total or 0)
                updated = True
            if request.copies_available is not None and request.copies_available != book.copies_available:
                book.copies_available = int(request.copies_available or 0)
                updated = True

            if updated:
                session.commit()
                session.refresh(book)
            session.close()

            return library_pb2.Book(
                id=book.id,
                title=book.title,
                author=book.author,
                isbn=book.isbn,
                copies_total=book.copies_total,
                copies_available=book.copies_available
            )
        else:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Book not found")
            return library_pb2.Book()

    def DeleteBook(self, request, context):
        print("Delete method called, ", request.id)
        print("request.id :", request.id, type(request.id))
        session = SessionLocal()
        book = session.query(BookModel).filter(
            BookModel.id == request.id
        ).first()

        if book:
            session.delete(book)
            session.commit()
            session.close()
            return library_pb2.Empty()
        else:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Book not found")
            return library_pb2.Empty()

    def ReturnBook(self, request, context):
        session = SessionLocal()
        borrowing = session.query(BorrowingModel).filter(
            BorrowingModel.id == request.borrowing_id).first()
        print(
            f"ReturnBook called with borrowing_id={request.borrowing_id}. Found: {borrowing is not None}")
        if not borrowing:
            session.close()
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Borrowing not found")
            return library_pb2.ReturnBookResponse()

        if borrowing.returned_at:
            session.close()
            context.set_code(grpc.StatusCode.FAILED_PRECONDITION)
            context.set_details("Book already returned")
            return library_pb2.ReturnBookResponse()

        borrowing.returned_at = datetime.datetime.now(datetime.timezone.utc)
        # Use fine_per_day from request if provided, else default to 1.0
        fine_per_day = getattr(request, 'fine_per_day', 1.0) or 1.0
        due_at = borrowing.due_at
        # Ensure due_at is timezone-aware (assume UTC if naive)
        if due_at and due_at.tzinfo is None:
            due_at = due_at.replace(tzinfo=datetime.timezone.utc)
        if due_at and borrowing.returned_at > due_at:
            days_late = (borrowing.returned_at - due_at).days
            borrowing.fine = days_late * fine_per_day
        else:
            borrowing.fine = 0.0
        # Increase book's available copies
        book = session.query(BookModel).filter(
            BookModel.id == borrowing.book_id).first()
        if book:
            book.copies_available += 1
        session.commit()
        response = library_pb2.ReturnBookResponse(
            borrowing=library_pb2.Borrowing(
                id=borrowing.id,
                book_id=borrowing.book_id,
                member_id=borrowing.member_id,
                borrow_date=borrowing.borrowed_at.isoformat() if borrowing.borrowed_at else "",
                return_date=borrowing.returned_at.isoformat() if borrowing.returned_at else "",
                fine=borrowing.fine
            )
        )
        session.close()
        return response


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    library_pb2_grpc.add_LibraryServiceServicer_to_server(
        LibraryService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server started on port 50051")
    server.wait_for_termination()


if __name__ == '__main__':
    serve()
