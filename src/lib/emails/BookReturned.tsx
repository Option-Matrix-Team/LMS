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

interface BookReturnedEmailProps {
    memberName: string;
    bookTitle: string;
    bookAuthor: string;
    libraryName: string;
}

export default function BookReturnedEmail({
    memberName = 'Member',
    bookTitle = 'Book Title',
    bookAuthor = 'Author Name',
    libraryName = 'Library',
}: BookReturnedEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Book returned: {bookTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Book Returned Successfully</Heading>
                    
                    <Text style={text}>
                        Dear {memberName},
                    </Text>
                    
                    <Text style={text}>
                        Thank you for returning the following book to {libraryName}:
                    </Text>
                    
                    <Section style={bookCard}>
                        <Text style={bookTitle_style}>✅ {bookTitle}</Text>
                        <Text style={bookAuthor_style}>by {bookAuthor}</Text>
                    </Section>
                    
                    <Text style={text}>
                        We hope you enjoyed the book! Feel free to visit us again to borrow more books.
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
    backgroundColor: '#d4edda',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
};

const bookTitle_style = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#155724',
    margin: '0 0 8px',
};

const bookAuthor_style = {
    fontSize: '14px',
    color: '#155724',
    margin: '0',
};

const footer = {
    fontSize: '14px',
    color: '#999999',
    margin: '30px 0 0',
};
