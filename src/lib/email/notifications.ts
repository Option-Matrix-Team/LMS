// Email notification helper for borrowing actions
// Import this in server actions to queue emails

import { addEmailJob, scheduleDueReminder, cancelDueReminder } from './queue';
import { format } from 'date-fns';

interface BookInfo {
    name: string;
    author: string;
}

interface MemberInfo {
    name: string;
    email: string;
}

interface LibraryInfo {
    name: string;
}

// Queue email when book is borrowed
export async function queueBorrowedEmail(
    member: MemberInfo,
    book: BookInfo,
    library: LibraryInfo,
    dueDate: Date,
    borrowingId: string
) {
    // Queue immediate borrowed confirmation
    await addEmailJob({
        type: 'book-borrowed',
        to: member.email,
        memberName: member.name,
        bookTitle: book.name,
        bookAuthor: book.author,
        libraryName: library.name,
        dueDate: format(dueDate, 'MMMM d, yyyy'),
        borrowingId,
    });

    // Schedule due reminder for 24 hours before due date
    await scheduleDueReminder(borrowingId, dueDate, {
        to: member.email,
        memberName: member.name,
        bookTitle: book.name,
        bookAuthor: book.author,
        libraryName: library.name,
        dueDate: format(dueDate, 'MMMM d, yyyy'),
        borrowingId,
    });
}

// Queue email when book is returned
export async function queueReturnedEmail(
    member: MemberInfo,
    book: BookInfo,
    library: LibraryInfo,
    borrowingId: string
) {
    // Cancel any pending due reminder
    await cancelDueReminder(borrowingId);

    // Queue return confirmation
    await addEmailJob({
        type: 'book-returned',
        to: member.email,
        memberName: member.name,
        bookTitle: book.name,
        bookAuthor: book.author,
        libraryName: library.name,
        borrowingId,
    });
}

// Queue email when borrowing is extended
export async function queueExtendedEmail(
    member: MemberInfo,
    book: BookInfo,
    library: LibraryInfo,
    newDueDate: Date,
    borrowingId: string
) {
    // Cancel old due reminder and schedule new one
    await cancelDueReminder(borrowingId);
    await scheduleDueReminder(borrowingId, newDueDate, {
        to: member.email,
        memberName: member.name,
        bookTitle: book.name,
        bookAuthor: book.author,
        libraryName: library.name,
        dueDate: format(newDueDate, 'MMMM d, yyyy'),
        borrowingId,
    });

    // Queue extension confirmation
    await addEmailJob({
        type: 'book-extended',
        to: member.email,
        memberName: member.name,
        bookTitle: book.name,
        bookAuthor: book.author,
        libraryName: library.name,
        newDueDate: format(newDueDate, 'MMMM d, yyyy'),
        borrowingId,
    });
}
