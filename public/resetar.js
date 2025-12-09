function getToken() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
    
    function getToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    console.log("TOKEN PEGOU:", token);
    return token;
}

async function resetarSenha() {
    const token = getToken();
    const novaSenha = document.getElementById("senha").value;

    const retorno = document.getElementById("retorno");
    retorno.textContent = "Aguarde...";

    const resp = await fetch("http://localhost:8000/api/resetar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha })
    });

    const data = await resp.json();

    if (!resp.ok) {
        retorno.textContent = data.error || "Erro.";
        return;
    }

    retorno.textContent = "Senha alterada com sucesso!";
}

}

async function resetarSenha() {
    const token = getToken();
    const novaSenha = document.getElementById("senha").value;

    const retorno = document.getElementById("retorno");
    retorno.textContent = "Aguarde...";

    const resp = await fetch("http://localhost:8000/api/resetar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha })
    });

    const data = await resp.json();

    if (!resp.ok) {
        retorno.textContent = data.error || "Erro.";
        return;
    }

    retorno.textContent = "Senha alterada com sucesso!";
}
