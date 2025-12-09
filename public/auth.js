async function cadastrar() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const req = await fetch("http://localhost:8000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const res = await req.json();

  document.getElementById("retorno").innerText =
    res.message || res.error;
}

async function logar() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const req = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const res = await req.json();

  if (res.token) {
    localStorage.setItem("token", res.token);
    window.location.href = "index.html";
  } else {
    document.getElementById("retorno").innerText = res.error;
  }
}
