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

interface DueReminderEmailProps {
    memberName: string;
    bookTitle: string;
    bookAuthor: string;
    dueDate: string;
    libraryName: string;
}

export default function DueReminderEmail({
    memberName = 'Member',
    bookTitle = 'Book Title',
    bookAuthor = 'Author Name',
    dueDate = 'Tomorrow',
    libraryName = 'Library',
}: DueReminderEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Reminder: {bookTitle} is due tomorrow</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>⏰ Book Due Tomorrow</Heading>
                    
                    <Text style={text}>
                        Dear {memberName},
                    </Text>
                    
                    <Text style={text}>
                        This is a friendly reminder that the following book is due tomorrow:
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
                        Please return the book on time to avoid overdue notices. If you need more time, 
                        visit the library to request an extension.
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
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
};

const bookTitle_style = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#856404',
    margin: '0 0 8px',
};

const bookAuthor_style = {
    fontSize: '14px',
    color: '#856404',
    margin: '0',
};

const dueDateSection = {
    backgroundColor: '#ffc107',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
    textAlign: 'center' as const,
};

const dueDateLabel = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#000',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px',
};

const dueDateValue = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#000',
    margin: '0',
};

const footer = {
    fontSize: '14px',
    color: '#999999',
    margin: '30px 0 0',
};
