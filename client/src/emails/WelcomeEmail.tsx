import { 
  Html, Body, Container, Section, Text, Heading, 
  Button, Hr, Link, Preview 
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userEmail: string;
}

export default function WelcomeEmail({ userEmail }: WelcomeEmailProps) {
  // 🔥 সাইটের URL ডাইনামিকভাবে নেওয়া
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  // 🔥 আনসাবস্ক্রাইব লিংক তৈরি করা
  const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  return (
    <Html>
      <Preview>AIToolsBD-তে যোগ দেওয়ার জন্য ধন্যবাদ! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>🚀 AIToolsBD</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>স্বাগতম AIToolsBD পরিবারে! 🎉</Heading>
            
            <Text style={text}>
              প্রিয় গ্রাহক,
            </Text>
            <Text style={text}>
              আমাদের নিউজলেটার সাবস্ক্রাইব করার জন্য আপনাকে অনেক ধন্যবাদ। আপনি এখন থেকে আমাদের সব নতুন আপডেট, এক্সক্লুসিভ অফার এবং সেরা AI টুলস সম্পর্কে সবার আগে জানতে পারবেন।
            </Text>

            <Hr style={hr} />

            {/* Features */}
            <Section style={features}>
              <Text style={featureTitle}>আপনি যা পাবেন:</Text>
              <Text style={featureItem}>✨ সপ্তাহের সেরা AI প্রম্পট ও টুলস</Text>
              <Text style={featureItem}>💰 এক্সক্লুসিভ ডিসকাউন্ট কোড</Text>
              <Text style={featureItem}>🆕 নতুন প্রোডাক্টের অগ্রিম আপডেট</Text>
              <Text style={featureItem}>📚 ফ্রি টিউটোরিয়াল ও গাইড</Text>
            </Section>

            <Hr style={hr} />

            {/* CTA */}
            <Section style={cta}>
              <Button href={`${siteUrl}/products`} style={button}>
                এখনই প্রোডাক্ট দেখুন →
              </Button>
            </Section>

            <Text style={text}>
              কোনো প্রশ্ন থাকলে আমাদের সাপোর্ট টিমকে <Link href="mailto:support@aitoolsbd.com" style={link}>support@aitoolsbd.com</Link> এ ইমেইল করুন।
            </Text>
          </Section>

          {/* 🔥 Footer with Unsubscribe Link */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 AIToolsBD. সর্বস্বত্ব সংরক্ষিত।
            </Text>
            <Text style={footerSmall}>
              আপনি এই ইমেইলটি পেয়েছেন কারণ আপনি AIToolsBD-এর নিউজলেটার সাবস্ক্রাইব করেছেন।{' '}
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                আনসাবস্ক্রাইব করুন
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '"Hind Siliguri", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const header = {
  padding: '24px',
  backgroundColor: '#4f46e5',
  borderRadius: '12px 12px 0 0',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  backgroundColor: '#ffffff',
  padding: '32px',
  borderLeft: '1px solid #e2e8f0',
  borderRight: '1px solid #e2e8f0',
};

const h1 = {
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const features = {
  backgroundColor: '#f1f5f9',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
};

const featureTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const featureItem = {
  color: '#475569',
  fontSize: '14px',
  margin: '8px 0',
};

const cta = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const link = {
  color: '#4f46e5',
  textDecoration: 'underline',
};

const footer = {
  backgroundColor: '#f1f5f9',
  padding: '24px',
  borderRadius: '0 0 12px 12px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#64748b',
  fontSize: '13px',
  margin: '0 0 8px',
};

const footerSmall = {
  color: '#94a3b8',
  fontSize: '11px',
  margin: '8px 0',
};

// 🔥 নতুন স্টাইল যোগ করা হয়েছে আনসাবস্ক্রাইব লিংকের জন্য
const unsubscribeLink = {
  color: '#ef4444', // লাল রঙ যাতে চোখে পড়ে
  textDecoration: 'underline',
  fontWeight: 'bold' as const,
};