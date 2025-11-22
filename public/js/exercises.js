// Exercise checking functionality

function checkAnswer(exerciseIndex, correctAnswer) {
  const selected = document.querySelector(`input[name="exercise-${exerciseIndex}"]:checked`);
  const feedback = document.getElementById(`feedback-${exerciseIndex}`);
  const explanation = document.getElementById(`explanation-${exerciseIndex}`);
  
  if (!selected) {
    feedback.style.display = 'block';
    feedback.className = 'alert alert-error';
    feedback.textContent = 'Please select an answer first.';
    return;
  }
  
  const userAnswer = parseInt(selected.value);
  const isCorrect = userAnswer === correctAnswer;
  
  feedback.style.display = 'block';
  
  if (isCorrect) {
    feedback.className = 'alert alert-success';
    feedback.innerHTML = '<strong>✓ Correct!</strong> Well done!';
  } else {
    feedback.className = 'alert alert-error';
    feedback.innerHTML = `<strong>✗ Incorrect.</strong> The correct answer is <strong>${String.fromCharCode(65 + correctAnswer)}</strong>.`;
  }
  
  if (explanation) {
    explanation.style.display = 'block';
  }
  
  // Highlight correct and incorrect answers
  const options = document.querySelectorAll(`input[name="exercise-${exerciseIndex}"]`);
  options.forEach((option, index) => {
    const label = option.closest('.option-label');
    if (index === correctAnswer) {
      label.style.borderColor = 'var(--success)';
      label.style.background = 'rgba(16, 185, 129, 0.1)';
    } else if (index === userAnswer && !isCorrect) {
      label.style.borderColor = 'var(--error)';
      label.style.background = 'rgba(239, 68, 68, 0.1)';
    }
  });
}

function checkPastAnswer(questionIndex, correctAnswer) {
  const selected = document.querySelector(`input[name="past-${questionIndex}"]:checked`);
  const feedback = document.getElementById(`past-feedback-${questionIndex}`);
  const explanation = document.getElementById(`past-explanation-${questionIndex}`);
  
  if (!selected) {
    feedback.style.display = 'block';
    feedback.className = 'alert alert-error';
    feedback.textContent = 'Please select an answer first.';
    return;
  }
  
  const userAnswer = parseInt(selected.value);
  const isCorrect = userAnswer === correctAnswer;
  
  feedback.style.display = 'block';
  
  if (isCorrect) {
    feedback.className = 'alert alert-success';
    feedback.innerHTML = '<strong>✓ Correct!</strong> Excellent work!';
  } else {
    feedback.className = 'alert alert-error';
    feedback.innerHTML = `<strong>✗ Incorrect.</strong> The correct answer is <strong>${String.fromCharCode(65 + correctAnswer)}</strong>.`;
  }
  
  if (explanation) {
    explanation.style.display = 'block';
  }
  
  // Highlight correct and incorrect answers
  const options = document.querySelectorAll(`input[name="past-${questionIndex}"]`);
  options.forEach((option, index) => {
    const label = option.closest('.option-label');
    if (index === correctAnswer) {
      label.style.borderColor = 'var(--success)';
      label.style.background = 'rgba(16, 185, 129, 0.1)';
    } else if (index === userAnswer && !isCorrect) {
      label.style.borderColor = 'var(--error)';
      label.style.background = 'rgba(239, 68, 68, 0.1)';
    }
  });
}
