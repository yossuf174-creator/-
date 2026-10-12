const url = "https://www.youtube.com/watch?v=jNQXAC9IVRw";

async function test() {
  try {
    const res = await fetch(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`);
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.log("Failed", e.message);
  }
}
test();
