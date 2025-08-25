from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Update the connection string as needed for your environment
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/library"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class BookModel(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    author = Column(String)
    isbn = Column(String)
    copies_total = Column(Integer)
    copies_available = Column(Integer)


# New: Member model
class MemberModel(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)


# Renamed: Borrowing model
class BorrowingModel(Base):
    __tablename__ = "borrowings"
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer)
    member_id = Column(Integer)
    borrowed_at = Column(DateTime)
    due_at = Column(DateTime)  # Use DateTime to match TIMESTAMPTZ
    returned_at = Column(DateTime, nullable=True)
    fine = Column(Float, default=0.0)
