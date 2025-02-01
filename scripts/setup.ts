async function setup() {
  try {
    const response = await fetch("http://localhost:3000/api/setup", {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to run setup");
    }

    console.log("Setup completed successfully!");
    console.log("Admin username:", data.username);
    console.log("Admin password: admin123");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

setup(); 