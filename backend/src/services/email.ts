import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/User';
import Couple from '../models/Couple';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendNotificationEmail = async (toUserId: string, subject: string, message: string) => {
    try {
        const user = await User.findById(toUserId);
        if (!user || user.settings?.emailNotifications === false) {
            return;
        }

        const appUrl = 'https://emotional-frontend-mcyr.onrender.com';

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #fce7f3; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.025em;">Emotional App ✨</h1>
                </div>
                <div style="padding: 40px 30px; background-color: #fff;">
                    <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin-top: 0;">Chào ${user.name},</p>
                    <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
                        ${message}
                    </p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${appUrl}" style="background-color: #f43f5e; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(244, 63, 94, 0.2);">
                            Mở ứng dụng ngay ❤️
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 40px;">
                        Hành trình yêu thương của bạn đang chờ đợi...
                    </p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
                    <p style="font-size: 12px; color: #cbd5e1; margin: 0;">
                        Bạn nhận được email này vì bạn đã bật thông báo trong cài đặt ứng dụng.
                    </p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"Couple App ✨" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: `[Couple App] ${subject}`,
            text: message, // Fallback text
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Notification email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending notification email:', error);
    }
};

export const notifyPartner = async (fromUserId: string, coupleId: string, subject: string, text: string) => {
    try {
        const couple = await Couple.findById(coupleId);
        if (!couple) return;

        const partnerId = couple.memberIds.find(id => id.toString() !== fromUserId.toString());
        if (!partnerId) return;

        await sendNotificationEmail(partnerId.toString(), subject, text);
    } catch (error) {
        console.error('Error notifying partner:', error);
    }
};
