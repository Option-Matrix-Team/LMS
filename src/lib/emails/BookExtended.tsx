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

interface BookExtendedEmailProps {
  memberName: string;
  bookTitle: string;
  bookAuthor: string;
  newDueDate: string;
  libraryName: string;
}

export default function BookExtendedEmail({
  memberName = "Member",
  bookTitle = "Book Title",
  bookAuthor = "Author Name",
  newDueDate = "January 15, 2025",
  libraryName = "Library",
}: BookExtendedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Borrowing extended: {bookTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Borrowing Extended</Heading>

          <Text style={text}>Dear {memberName},</Text>

          <Text style={text}>
            Your borrowing period has been extended for the following book:
          </Text>

          <Section style={bookCard}>
            <Text style={bookTitle_style}>🔄 {bookTitle}</Text>
            <Text style={bookAuthor_style}>by {bookAuthor}</Text>
          </Section>

          <Section style={dueDateSection}>
            <Text style={dueDateLabel}>New Due Date</Text>
            <Text style={dueDateValue}>{newDueDate}</Text>
          </Section>

          <Text style={note}>
            Note: Extensions can only be granted once per borrowing.
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
  color: "#1a1a1a",
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
  backgroundColor: "#e7f3ff",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const bookTitle_style = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#0066cc",
  margin: "0 0 8px",
};

const bookAuthor_style = {
  fontSize: "14px",
  color: "#0066cc",
  margin: "0",
};

const dueDateSection = {
  backgroundColor: "#d4edda",
  borderRadius: "8px",
  padding: "16px",
  margin: "20px 0",
  textAlign: "center" as const,
};

const dueDateLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#155724",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const dueDateValue = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#155724",
  margin: "0",
};

const note = {
  fontSize: "14px",
  color: "#666666",
  fontStyle: "italic" as const,
  margin: "16px 0",
};

const footer = {
  fontSize: "14px",
  color: "#999999",
  margin: "30px 0 0",
};
