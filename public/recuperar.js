async function recuperar() {
    const email = document.getElementById("email").value;
    const retorno = document.getElementById("retorno");

    retorno.textContent = "Aguarde...";

    const resp = await fetch("http://localhost:8000/api/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const data = await resp.json();

    if (!resp.ok) {
        retorno.textContent = data.error || "Erro.";
        return;
    }

    retorno.textContent = "Email enviado! Verifique sua caixa de entrada.";
}
