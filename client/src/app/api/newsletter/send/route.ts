import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    console.log("📨 Newsletter API called");

    // ১. রিকোয়েস্ট ডেটা নেওয়া
    const { subject, content, emails } = await request.json();
    
    if (!subject || !content || !emails || !Array.isArray(emails)) {
      return NextResponse.json({ 
        error: 'Subject, Content এবং Emails প্রয়োজন' 
      }, { status: 400 });
    }

    if (emails.length === 0) {
      return NextResponse.json({ 
        error: 'কোনো ইমেইল পাওয়া যায়নি' 
      }, { status: 400 });
    }

    console.log(`✅ Sending to ${emails.length} subscribers...`);

    // ২. ইমেইল পাঠানো (Resend Batch API)
    let sentCount = 0;
    let failedCount = 0;

    // Resend এর ব্যাচ লিমিট ১০০, তাই chunk করে পাঠাতে হবে
    for (let i = 0; i < emails.length; i += 100) {
      const chunk = emails.slice(i, i + 100);
      
      try {
        const { error: sendError } = await resend.batch.send(
          chunk.map((email: string) => ({
            from: 'AIToolsBD <onboarding@resend.dev>', 
            to: email,
            subject: subject,
            html: `
              <div style="font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px;">🚀 AIToolsBD</h1>
                  <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
                    আপনি এই ইমেইলটি পেয়েছেন কারণ আপনি AIToolsBD-এর নিউজলেটার সাবস্ক্রাইব করেছেন। 
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #ef4444; text-decoration: underline;">আনসাবস্ক্রাইব করুন</a>
                  </p>
                </div>
                <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                  <div style="font-size: 15px; line-height: 26px; white-space: pre-wrap;">
                    ${content}
                  </div>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                      প্রোডাক্ট দেখুন →
                    </a>
                  </div>
                </div>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; color: #64748b; font-size: 12px;">
                  © 2026 AIToolsBD. সর্বস্বত্ব সংরক্ষিত।<br>
                  আপনি এই ইমেইলটি পেয়েছেন কারণ আপনি AIToolsBD-এর নিউজলেটার সাবস্ক্রাইব করেছেন।
                </div>
              </div>
            `,
          }))
        );

        if (sendError) {
          console.error('❌ Batch send error:', sendError);
          failedCount += chunk.length;
        } else {
          sentCount += chunk.length;
          console.log(`✅ Sent to ${chunk.length} users in this batch`);
        }
      } catch (batchError) {
        console.error('❌ Batch processing error:', batchError);
        failedCount += chunk.length;
      }
    }

    console.log(`🎉 Successfully sent to ${sentCount} users. Failed: ${failedCount}`);
    
    const message = failedCount === 0 
      ? `${sentCount} টি ইমেইল সফলভাবে পাঠানো হয়েছে।`
      : `${sentCount} টি ইমেইল সফলভাবে পাঠানো হয়েছে। ${failedCount} টি ব্যর্থ হয়েছে।`;

    return NextResponse.json({ 
      success: true, 
      message: message
    });

  } catch (error: any) {
    console.error('💥 CRITICAL API ERROR:', error);
    return NextResponse.json({ 
      error: 'সার্ভার এরর: ' + (error.message || 'অজানা সমস্যা') 
    }, { status: 500 });
  }
}