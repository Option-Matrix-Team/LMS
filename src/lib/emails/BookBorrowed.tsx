import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface BookBorrowedEmailProps {
    memberName: string;
    bookTitle: string;
    bookAuthor: string;
    dueDate: string;
    libraryName: string;
}

export default function BookBorrowedEmail({
    memberName = 'Member',
    bookTitle = 'Book Title',
    bookAuthor = 'Author Name',
    dueDate = 'January 1, 2025',
    libraryName = 'Library',
}: BookBorrowedEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>You have borrowed: {bookTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Book Borrowed Successfully</Heading>
                    
                    <Text style={text}>
                        Dear {memberName},
                    </Text>
                    
                    <Text style={text}>
                        You have successfully borrowed the following book from {libraryName}:
                    </Text>
                    
                    <Section style={bookCard}>
                        <Text style={bookTitle_style}>📚 {bookTitle}</Text>
                        <Text style={bookAuthor_style}>by {bookAuthor}</Text>
                    </Section>
                    
                    <Section style={dueDateSection}>
                        <Text style={dueDateLabel}>Due Date</Text>
                        <Text style={dueDateValue}>{dueDate}</Text>
                    </Section>
                    
                    <Text style={text}>
                        Please return the book on or before the due date to avoid overdue notices.
                    </Text>
                    
                    <Text style={footer}>
                        — {libraryName}
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '560px',
};

const heading = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center' as const,
    margin: '0 0 30px',
};

const text = {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#484848',
    margin: '16px 0',
};

const bookCard = {
    backgroundColor: '#f0f7ff',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
};

const bookTitle_style = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 8px',
};

const bookAuthor_style = {
    fontSize: '14px',
    color: '#666666',
    margin: '0',
};

const dueDateSection = {
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
    textAlign: 'center' as const,
};

const dueDateLabel = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#856404',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px',
};

const dueDateValue = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#856404',
    margin: '0',
};

const footer = {
    fontSize: '14px',
    color: '#999999',
    margin: '30px 0 0',
};
