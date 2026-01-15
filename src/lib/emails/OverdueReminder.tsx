import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OverdueReminderEmailProps {
  memberName: string;
  bookTitle: string;
  bookAuthor: string;
  dueDate: string;
  daysOverdue: number;
  libraryName: string;
}

export default function OverdueReminderEmail({
  memberName = "Member",
  bookTitle = "Book Title",
  bookAuthor = "Author Name",
  dueDate = "January 1, 2025",
  daysOverdue = 1,
  libraryName = "Library",
}: OverdueReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        OVERDUE: {bookTitle} - {String(daysOverdue)} days overdue
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>⚠️ Book Overdue</Heading>

          <Text style={text}>Dear {memberName},</Text>

          <Text style={text}>
            The following book is overdue and needs to be returned immediately:
          </Text>

          <Section style={bookCard}>
            <Text style={bookTitle_style}>📕 {bookTitle}</Text>
            <Text style={bookAuthor_style}>by {bookAuthor}</Text>
          </Section>

          <Section style={overdueSection}>
            <Text style={overdueLabel}>Overdue By</Text>
            <Text style={overdueValue}>
              {daysOverdue} {daysOverdue === 1 ? "day" : "days"}
            </Text>
            <Text style={originalDue}>Originally due: {dueDate}</Text>
          </Section>

          <Text style={urgentText}>
            Please return this book as soon as possible. Continued overdue
            status may affect your ability to borrow books in the future.
          </Text>

          <Text style={footer}>— {libraryName}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#dc3545",
  textAlign: "center" as const,
  margin: "0 0 30px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#484848",
  margin: "16px 0",
};

const bookCard = {
  backgroundColor: "#f8d7da",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
  border: "1px solid #f5c6cb",
};

const bookTitle_style = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#721c24",
  margin: "0 0 8px",
};

const bookAuthor_style = {
  fontSize: "14px",
  color: "#721c24",
  margin: "0",
};

const overdueSection = {
  backgroundColor: "#dc3545",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
  textAlign: "center" as const,
};

const overdueLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#ffffff",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const overdueValue = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 8px",
};

const originalDue = {
  fontSize: "12px",
  color: "#ffcccc",
  margin: "0",
};

const urgentText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#721c24",
  backgroundColor: "#fff3cd",
  padding: "16px",
  borderRadius: "8px",
  margin: "16px 0",
};

const footer = {
  fontSize: "14px",
  color: "#999999",
  margin: "30px 0 0",
};
