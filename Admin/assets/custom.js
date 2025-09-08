// const API_URL = "http://192.168.207.13:8080";
const API_URL = "http://127.0.0.1:8080";

// Fungsi login
function login() {
  let email = $("#email").val();
  let password = $("#password").val();
  console.log(email);

  $.ajax({
    url: `${API_URL}/login`,
    type: "POST",
    xhrFields: {
      withCredentials: true,
    },
    contentType: "application/json",
    data: JSON.stringify({ email, password }),
    success: function (response) {
      document.cookie = `token=${response.data.access_token}; path=/;`;

      const base64Url = response.data.access_token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const data = JSON.parse(jsonPayload);
      if (data.role === "admin") {
        window.location.href =
          "http://127.0.0.1:5500/Admin/dashboard/dashboard.html";
      } else if (data.role === "dosen") {
        window.location.href =
          "http://127.0.0.1:5500/Dosen/dashboard/dashboard.html";
      } else if (data.role === "mahasiswa") {
        window.location.href =
          "http://127.0.0.1:5500/mahasiswa/matakuliah/matakuliah.html";
      }
    },
    error: function (xhr) {
      if (xhr.status === 400) {
        $("#message").text("Kamu sudah login");
        return;
      }
      $("#message").text("Login gagal!");
    },
  });
}

function logout() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  $.ajax({
    url: `${API_URL}/logout`,
    type: "POST",
    xhrFields: {
      withCredentials: true,
    },
    success: function () {
      alert("Logout berhasil!");
      window.location.href = "/index.html";
    },
    error: function () {
      alert("Logout gagal, coba lagi!");
    },
  });
}

// Fungsi untuk request API dengan access token
function fetchProtectedData() {
  $.ajax({
    url: `${API_URL}/api/status-login`,
    type: "GET",
    xhrFields: {
      withCredentials: true,
    },
    success: function (response) {
      console.log("Data:", response);
    },
    error: function (xhr) {
      if (xhr.status === 401) {
        refreshAccessToken();
      }
    },
  });
}

// Fungsi refresh access token
function refreshAccessToken() {
  $.ajax({
    url: `${API_URL}/refresh`,
    type: "POST",
    contentType: "application/json",
    xhrFields: {
      withCredentials: true,
    },
    success: function (response) {
      document.cookie = `token=${response.data.access_token}; path=/;`;
      if (typeof callback === "function") {
        callback();
      }
    },
    error: function () {
      console.log("sudah abis");
      window.location.href = "/index.html";
    },
  });
}
// Akhir Fungsi login

function decodeJWT(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  const data = JSON.parse(jsonPayload);
  document.getElementById("profile-name").innerHTML = `${toTitleCase(
    data.name
  )}`;
  document.getElementById("profile-email").innerHTML = data.email;
  document.getElementById("profile-image").src =
    "http://127.0.0.1:8080/assets/image/" + data.image;

  return data;
}

function formatDate(dateParam) {
  const dateString = dateParam;
  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formattedDate;
}

function toTitleCase(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDurasi(totalMenit) {
  const jam = Math.floor(totalMenit / 60);
  const menit = totalMenit % 60;
  return `${jam} Jam ${menit} Menit`;
}
