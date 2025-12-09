async function logar() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const retorno = document.getElementById("retorno");
    retorno.textContent = "Aguarde...";

    try {
        const response = await fetch("http://localhost:8000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            retorno.textContent = data.error || "Erro ao logar.";
            return;
        }

        // 🔥 SALVANDO O TOKEN — ESSENCIAL!
        localStorage.setItem("token", data.token);

        retorno.textContent = "Login realizado!";

        // Redirecionar para o TODO LIST
        window.location.href = "index.html";

    } catch (err) {
        retorno.textContent = "Erro ao conectar ao servidor.";
        console.error(err);
    }
}
