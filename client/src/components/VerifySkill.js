import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is included

const VerifySkill = ({ userId }) => {
  const { skill } = useParams();
  const [data, setData] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Function to start the test
  const startTest = async () => {
    setTestStarted(true);
    setQuestionsCount(1);
    await fetchQuestion(); // Fetch the first question
  };

  // Function to fetch an MCQ for the given skill
  const fetchQuestion = async () => {
    if (questionsCount < 10) {
      setIsLoading(true);
      setSelectedAnswer('');
      setData('');
      setOptions([]);

      try {
        const response = await axios.post('https://skillshare-p28w.onrender.com/api/fetch-gemini', {
          prompt: `Generate a multiple-choice question (MCQ) for the skill: ${skill}. Provide the question followed by options A, B, C, and D, each on a new line. Indicate the correct answer in the following format: "Correct Answer: A" and don't bold the answer`,
        });
        const questionData = response.data.text || '';

        // Extract the question and options from the response
        const questionParts = questionData.split('\n').filter(line => line); // Remove any empty lines
        const question = questionParts[0]; // First line is the question
        const optionsArray = questionParts.slice(1, 5); // Next four lines are options 1, 2, 3, 4
        const correct = questionParts[5]; // Assuming the correct answer is at index 5

        setData(question);
        setOptions(optionsArray);
        setCorrectAnswer(correct.split(' ')[2]); // Correct answer from the format "Correct Answer: A"
        setTimeLeft(30); // Reset the timer for the new question
      } catch (err) {
        console.error('Failed to fetch data from the backend', err);
      } finally {
        setIsLoading(false); // Set loading state to false after fetching
      }
    } else {
      completeTest(); // Complete the test after 10 questions
    }
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (testStarted && !isTestComplete && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult && selectedAnswer) {
      submitAnswer(); // Auto-submit but don't show result until 'Submit' button is clicked
    }
    return () => clearTimeout(timer);
  }, [timeLeft, testStarted, showResult]);

  // Function to handle answer submission
  const submitAnswer = () => {
    if (!selectedAnswer) return; // Don't submit if no answer is selected
    setShowResult(true); // Only show the result after the submission
    setTimeLeft(0); // Stop the timer

    if (selectedAnswer === correctAnswer) {
      setCorrectAnswersCount(prevCount => prevCount + 1); // Increment correct answer count
    }
  };

  // Function to handle "Next" button click to skip to the next question
  const nextQuestion = () => {
    if (!isLoading) { // Only proceed if not loading
      setShowResult(false); // Hide the result
      setQuestionsCount(prevCount => prevCount + 1); // Increment question count
      fetchQuestion(); // Fetch the next question
    }
  };

  // Function to complete the test and verify teaching skill if needed
  const completeTest = async () => {
    setIsTestComplete(true);

    // If the user has more than 7 correct answers, verify their teaching skill
    if (correctAnswersCount >= 7) {
      try {
        await axios.put('https://skillshare-p28w.onrender.com/api/verify-teaching-skill', { skill, userId }); // Send skill and userId
        await axios.put('https://skillshare-p28w.onrender.com/api/add-tokens', { userId, tokens: 50 });
        alert('Teaching skill has been verified! and 50 tokens added to your Account.');
      } catch (err) {
        console.error('Failed to verify teaching skill', err);
      }
    } else {
      alert('Test completed but not enough correct answers for verification.');
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm p-4">
            <h3 className="text-center mb-4">Skill Test for: {skill}</h3>

            {!testStarted ? (
              <div>
                <h4>Test Instructions</h4>
                <p>This test will assess your skills in {skill}. Welcome to the Skill Verification Test! Show us what you’ve got and prove your expertise.
                  To get verified on this app you have pass the criteria of 70% .
                  Each ques have 30Sec time limit to answer the question.
                  You will be presented with a series of questions designed to assess your proficiency in your chosen field.</p>
                <button className="btn btn-primary w-100" onClick={startTest}>
                  Start Test
                </button>
              </div>
            ) : isTestComplete ? (
              <div className="text-center">
                <h4 className="text-success">Test Complete</h4>
                <p>Thank you for completing the test.</p>
              </div>
            ) : (
              <div>
                <h4>Question {questionsCount} of 10</h4>
                {isLoading ? (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <div className="fade-in">
                    <p className="lead">{data}</p>
                    <ul className="list-group mb-3">
                      {options.map((option, index) => (
                        <li key={index} className="list-group-item">
                          <label>
                            <input
                              type="radio"
                              className="me-2"
                              value={option[0]} // The first character of the option string, like 'A', 'B', etc.
                              checked={selectedAnswer === option[0]}
                              onChange={(e) => setSelectedAnswer(e.target.value)}
                            />
                            {option}
                          </label>
                        </li>
                      ))}
                    </ul>

                    <div className="progress mb-3">
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{ width: `${(timeLeft / 30) * 100}%` }}
                        aria-valuenow={timeLeft}
                        aria-valuemin="0"
                        aria-valuemax="30"
                      >
                        {timeLeft} seconds left
                      </div>
                    </div>

                    <div className="d-flex justify-content-between">
                      <button className="btn btn-primary" onClick={submitAnswer} disabled={!selectedAnswer}>
                        Submit Answer
                      </button>
                      <button className="btn btn-secondary" onClick={nextQuestion} disabled={!showResult}>
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {showResult && (
                  <div className={`alert mt-3 ${selectedAnswer === correctAnswer ? 'alert-success' : 'alert-danger'}`}>
                    {selectedAnswer === correctAnswer
                      ? 'Correct!'
                      : `Incorrect! The correct answer is ${correctAnswer}.`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifySkill;
