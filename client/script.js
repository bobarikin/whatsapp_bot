const btn = document.querySelector('.btn_js')
const form = document.querySelector('.form_js')
const input = document.querySelector('.input_js')

async function buttonHandler() {
  let response = await fetch('http://localhost:5000/widget', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify({
      message: input.value
    })
  })
  let message = await response.json()
  console.log(message.message)
  input.value = ''
}

btn.addEventListener('click', buttonHandler)

form.addEventListener('submit', (event) => {
    event.preventDefault()
})