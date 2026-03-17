export function createLoginPage({ sessionStore, router }) {
  const root = document.createElement("section");
  root.className = "page-wrap";
  root.innerHTML = `
    <article class="panel" style="max-width:460px;">
      <h2 class="mono">Operator Login</h2>
      <form id="login-form" class="field" style="margin-top:10px;">
        <label>Email</label>
        <input type="email" name="email" required />
        <label>Password</label>
        <input type="password" name="password" required />
        <button type="submit" class="btn btn-primary">Sign In</button>
        <p class="muted" id="login-status"></p>
      </form>
    </article>
  `;

  const form = root.querySelector("#login-form");
  const statusNode = root.querySelector("#login-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    statusNode.textContent = "Authenticating...";
    try {
      await sessionStore.login(data.get("email"), data.get("password"));
      router.navigate("/dashboard");
    } catch (error) {
      statusNode.textContent = error.message;
    }
  });

  return root;
}
