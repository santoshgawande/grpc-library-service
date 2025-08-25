import grpc
from proto import library_pb2
from proto import library_pb2_grpc


def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = library_pb2_grpc.LibraryServiceStub(channel)

        # List books
        try:
            response = stub.ListBooks(library_pb2.Empty())
            print("Books:")
            for book in response.books:
                print(
                    f"Book ID: {book.id}, Title: {book.title}, Author: {book.author}")
        except grpc.RpcError as e:
            print(f"gRPC error during ListBooks: {e}")

        # Add a member
        try:
            add_member_request = library_pb2.Member(
                name="Alice Smith",
                email="alice@example.com"
            )
            member_response = stub.AddMember(add_member_request)
            print("AddMember Response:", member_response)
        except grpc.RpcError as e:
            print(f"gRPC error during AddMember: {e}")

        # List members
        try:
            members_response = stub.ListMembers(library_pb2.Empty())
            print("Members:")
            for member in members_response.members:
                print(
                    f"Member ID: {member.id}, Name: {member.name}, Email: {member.email}")
        except grpc.RpcError as e:
            print(f"gRPC error during ListMembers: {e}")

        # Add a book
        try:
            add_book_request = library_pb2.Book(
                title="Python 101",
                author="Bob Author",
                isbn="1234567890",
                copies_total=3,
                copies_available=3
            )
            book_response = stub.AddBook(add_book_request)
            print("AddBook Response:", book_response)
        except grpc.RpcError as e:
            print(f"gRPC error during AddBook: {e}")

        # Borrow a book (by member)
        try:
            borrow_request = library_pb2.BorrowBookRequest(
                book_id=1,  # adjust as needed
                member_id=1  # adjust as needed
            )
            loan_response = stub.BorrowBook(borrow_request)
            print("BorrowBook Response:", loan_response)
        except grpc.RpcError as e:
            print(f"gRPC error during BorrowBook: {e}")

        # List loans
        try:
            loans_response = stub.ListLoans(library_pb2.Empty())
            print("Loans:")
            for loan in loans_response.loans:
                print(
                    f"Loan ID: {loan.id}, Book ID: {loan.book_id}, Member ID: {loan.member_id}, Borrow Date: {loan.borrow_date}, Return Date: {loan.return_date}")
        except grpc.RpcError as e:
            print(f"gRPC error during ListLoans: {e}")

        # Return a book (by loan)
        try:
            return_loan = library_pb2.Loan(
                id=1,  # adjust as needed
                book_id=1,
                member_id=1,
                borrow_date="2025-08-24T10:00:00Z",
                return_date="2025-08-25T10:00:00Z"
            )
            return_response = stub.ReturnBook(return_loan)
            print("ReturnBook Response:", return_response)
        except grpc.RpcError as e:
            print(f"gRPC error during ReturnBook: {e}")


if __name__ == '__main__':
    run()
