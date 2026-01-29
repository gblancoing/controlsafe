import nodemailer from 'nodemailer';

/**
 * Crea y retorna un transporter de nodemailer configurado con las variables de entorno
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  // cPanel "Secure SSL/TLS" suele usar puerto 465 (SMTPS). 587 es para STARTTLS.
  const secure = process.env.SMTP_SECURE !== undefined
    ? process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1'
    : port === 465;

  if (!host || !user || !password) {
    throw new Error('Configuración SMTP incompleta. Verifica las variables de entorno SMTP_HOST, SMTP_USER y SMTP_PASSWORD');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: password,
    },
  });
}

/**
 * Envía un email usando nodemailer
 * @param to Dirección de correo del destinatario
 * @param subject Asunto del email
 * @param html Contenido HTML del email
 * @param text Contenido de texto plano del email (opcional)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  try {
    // Si no hay configuración SMTP, solo logueamos (modo desarrollo)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('=== EMAIL (MODO DESARROLLO - SMTP NO CONFIGURADO) ===');
      console.log('Para:', to);
      console.log('Asunto:', subject);
      console.log('Contenido HTML:', html);
      if (text) console.log('Contenido texto:', text);
      console.log('====================================================');
      return;
    }

    const transporter = createTransporter();
    const fromName = process.env.SMTP_FROM || 'ControlSafe';
    const fromEmail = process.env.SMTP_USER || '';
    const from = fromEmail && !fromName.includes('@')
      ? `"${fromName.replace(/"/g, '')}" <${fromEmail}>`
      : (fromName.includes('@') ? fromName : fromEmail);

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Convertir HTML a texto si no se proporciona
    });

    console.log(`Email enviado exitosamente a ${to}`);
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
}

/**
 * Envía un email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  const subject = 'Recuperación de Contraseña - ControlSafe';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
      <p>Hola ${name},</p>
      <p>Has solicitado restablecer tu contraseña en ControlSafe.</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Restablecer Contraseña
        </a>
      </p>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        ControlSafe - Sistema de Gestión de Flota y Mantenimiento
      </p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Envía un email de mensaje masivo
 */
export async function sendBulkMessageEmail(
  to: string,
  recipientName: string,
  subject: string,
  message: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">${subject}</h2>
      <p>Estimado/a ${recipientName},</p>
      <div style="margin: 20px 0; line-height: 1.6;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        ControlSafe - Sistema de Gestión de Flota y Mantenimiento
      </p>
    </div>
  `;

  await sendEmail(to, subject, html);
}
