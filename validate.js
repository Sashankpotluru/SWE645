/* Author: Sri Sashank Potluru
   File: validate.js
   Purpose: Client-side validation for the SWE645 survey form. */

function parseRaffle(input) {
  return input
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(Number);
}

function validateRaffle(values) {
  if (values.length < 10) return { ok: false, reason: "Please enter at least ten numbers." };
  for (const n of values) {
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      return { ok: false, reason: "Numbers must be integers from 1 to 100." };
    }
  }
  return { ok: true };
}

function validateForm(ev) {
  ev.preventDefault();
  const raffleRaw = document.getElementById("raffle").value;
  const resultEl = document.getElementById("result");
  const numbers = parseRaffle(raffleRaw);
  const check = validateRaffle(numbers);

  // Require at least one "likes" checkbox.
  const likesChecked = Array.from(document.querySelectorAll('input[name="likes"]:checked')).length > 0;
  if (!likesChecked) {
    resultEl.textContent = "Please select at least one item you liked about the campus.";
    resultEl.className = "w3-text-red";
    return false;
  }

  if (!check.ok) {
    resultEl.textContent = check.reason;
    resultEl.className = "w3-text-red";
    return false;
  }

  // Optional win logic: if any number equals today's day-of-month, they "win".
  const day = new Date().getDate();
  const won = numbers.includes(day);
  resultEl.className = won ? "w3-text-green" : "w3-text-blue";
  resultEl.textContent = won
    ? "Congrats! Your raffle entry matches today’s lucky number. You win a free movie ticket!"
    : "Thanks! Your survey has been submitted.";
  return false; // prevent navigation; assignment is client-side only
}
