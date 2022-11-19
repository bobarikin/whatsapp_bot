const $btn = document.querySelector('.btn_js')
const $form = document.querySelector('.form_js')
const $input = document.querySelector('.input_js')
const $message = document.querySelector('.message_js')
const $auth = document.querySelector('.auth_js')
const $btn_auth = document.querySelector('.btn_auth_js')
const $name = document.querySelector('.name_js')
const $phone = document.querySelector('.phone_js')
const $password = document.querySelector('.password_js')

async function buttonHandler() {
  let response = await fetch('http://localhost:5000/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}` 
    },
    mode: 'cors',
    body: JSON.stringify({
      message: $input.value,
    }),
  })
  let message = await response.json()
  if (!response.ok) {
    $auth.classList.remove('hidden')
    $message.textContent = message.message
  }

  $input.value = ''
}

async function btnAuthHandler() {
  let response = await fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify({
      userName: $name.value,
      userPhone: $phone.value,
      userPassword: $password.value,
    }),
  })
  let message = await response.json()
  $auth.classList.toggle('hidden')
  console.log(message.message)
  localStorage.setItem('token', message.token)
  $name.value = ''
  $phone.value = ''
  $password.value = ''
}

$btn.addEventListener('click', buttonHandler)

// $input.addEventListener('change', buttonHandler)

$btn_auth.addEventListener('click', btnAuthHandler)

$form.addEventListener('submit', (event) => {
  event.preventDefault()
})

$auth.addEventListener('submit', (event) => {
  event.preventDefault()
})
