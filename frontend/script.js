// Smooth page enter
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-loaded");
});

// Smooth page exit for internal links
document.addEventListener("click", function (e) {
  const link = e.target.closest("a");

  if (!link) return;

  const href = link.getAttribute("href");

  if (!href || href.startsWith("http") || href.startsWith("#")) return;

  e.preventDefault();

  document.body.classList.remove("page-loaded");
  document.body.classList.add("page-exit");

  setTimeout(() => {
    window.location.href = href;
  }, 400);
});

// SIGN UP
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  };

  const res = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    window.location.href = "/login.html";
  } else {
    alert("Signup failed");
  }
});


// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const payload = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    window.location.href = "/";
  } else {
    alert("Invalid credentials");
  }
});


// SHOW LOGGED-IN USER + ENABLE ORDER BUTTON
(async () => {
  try {
    const res = await fetch("/me", { credentials: "include" });

    if (!res.ok) return;

    const user = await res.json();

    document.getElementById("userInfo").innerText =
      `Welcome, ${user.name}`;

    const btn = document.getElementById("orderBtn");
    if (btn) {
      btn.style.display = "inline-block";
      btn.addEventListener("click", () => {
        window.location.href = "/order.html";
      });
    }

  } catch (err) {
    console.log("User not logged in");
  }
})();



// CREATE ORDER
document.getElementById("orderForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(e.target);

  const payload = {
    origin: data.get("origin"),
    destination: data.get("destination"),
    weight: data.get("weight"),
  };

  const res = await fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert("Order placed successfully 📦");
    e.target.reset();
  }
});
const progressBar = document.getElementById("progressBar");

function startProgress() {
  if (!progressBar) return;
  progressBar.style.width = "30%";
  setTimeout(() => progressBar.style.width = "70%", 200);
}

function finishProgress() {
  if (!progressBar) return;
  progressBar.style.width = "100%";
  setTimeout(() => {
    progressBar.style.width = "0%";
  }, 300);
}



function finishProgress() {
  progressBar.style.width = "100%";
  setTimeout(() => progressBar.style.width = "0%", 300);
}
function smoothNavigate(url, direction = "left") {
  startProgress();
  loader.classList.add("active");

  document.body.classList.remove("page-enter");
  document.body.classList.add(
    direction === "left" ? "page-exit-left" : "page-exit-right"
  );

  setTimeout(() => {
    window.location.href = url;
  }, 450);
}

window.addEventListener("load", finishProgress);
