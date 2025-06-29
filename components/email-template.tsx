interface EmailTemplateProps {
  name: string;
  email: string;
  message: string;
}

const EmailTemplate = ({ name, email, message }: EmailTemplateProps) => {
  const paragraphs = message.split(/\n+/g);
  return (
    <div>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      <p style={{ color: "gray", fontSize: "12px", marginTop: "24px" }}>
        From: {`${name} <${email}>`}
      </p>
    </div>
  );
};

export default EmailTemplate;
