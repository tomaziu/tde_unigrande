import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(destino, assunto, conteudo) {
  try {
    const data = await resend.emails.send({
      from: "noreply@seuprojeto.app", // domínio do Resend
      to: destino,
      subject: assunto,
      html: conteudo
    });

    console.log("Email enviado:", data);
    return true;

  } catch (error) {
    console.log("Erro ao enviar email:", error);
    return false;
  }
}
