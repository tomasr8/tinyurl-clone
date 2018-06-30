$(document).ready(() => {
  console.log("ready")

  $(".url-form").submit(event => {
    event.preventDefault()
    const url = $(".url").val()

    console.log("submitting")

    fetch("/shorten", {
      body: JSON.stringify({ url }),
      headers: {
        "content-type": "application/json"
      },
      method: "POST",
    }).then(res => res.json())
      .then(({ shortURL, error }) => {
        if (error) {
          console.error(error)
          $(".error-container .error").css("transition", "all 0.3s ease-out")
          $(".error-container .error").css("top", "0")
          $(".error-container .error").text(error)
          $(".output .output-url").text("")
        } else {
          const host = document.URL.startsWith("http") ?
            document.URL.slice(7) : document.URL.slice(8)
          $(".output .output-url").text(`${host}${shortURL}`)
          $(".error-container .error").css("transition", "all 0.3s ease-in")
          $(".error-container .error").css("top", "-32px")
          $(".output").css("visibility", "visible")
        }
      })
      .catch(err => console.error(err))
  })

  $(".output .copy-btn").click(() => {
    copyToClipboard($(".output .output-url").text())
    console.log("Copied to Clipboard")
  })
})

function copyToClipboard(str) {
  const el = document.createElement("textarea")
  el.value = str
  el.setAttribute("readonly", "")
  el.style.position = "absolute"
  el.style.left = "-9999px"
  document.body.appendChild(el)
  el.select()
  document.execCommand("copy")
  document.body.removeChild(el)
}
