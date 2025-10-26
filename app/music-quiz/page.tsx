"use client";

import { useRef, useState } from "react";
import { questions } from "./questions";
import type { Answer, QuestionResult } from "./types";

export default function MusicQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer>({
    songName: "",
    originalArtist: "",
    coverStyle: "",
  });
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleRestartAudio = () => {
    setVideoKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const question = questions[currentQuestion];
    const correct = {
      songName:
        answers.songName.trim().toLowerCase() ===
        question.correctAnswers.songName.toLowerCase(),
      originalArtist:
        answers.originalArtist.trim().toLowerCase() ===
        question.correctAnswers.originalArtist.toLowerCase(),
      coverStyle:
        answers.coverStyle.trim().toLowerCase() ===
        question.correctAnswers.coverStyle.toLowerCase(),
    };

    const result: QuestionResult = {
      questionIndex: currentQuestion,
      answer: { ...answers },
      correct,
    };

    setResults([...results, result]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswers({ songName: "", originalArtist: "", coverStyle: "" });
      setIsPlaying(false);
      setVideoKey((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleQuizRestart = () => {
    setCurrentQuestion(0);
    setAnswers({ songName: "", originalArtist: "", coverStyle: "" });
    setResults([]);
    setShowSummary(false);
    setIsPlaying(false);
    setVideoKey((prev) => prev + 1);
  };

  if (showSummary) {
    const totalCorrect = results.reduce(
      (acc, result) => {
        return {
          songName: acc.songName + (result.correct.songName ? 1 : 0),
          originalArtist:
            acc.originalArtist + (result.correct.originalArtist ? 1 : 0),
          coverStyle: acc.coverStyle + (result.correct.coverStyle ? 1 : 0),
        };
      },
      { songName: 0, originalArtist: 0, coverStyle: 0 },
    );

    const totalAnswers = results.length * 3;
    const totalScore =
      totalCorrect.songName +
      totalCorrect.originalArtist +
      totalCorrect.coverStyle;

    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Quiz Summary</h1>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Final Score: {totalScore} / {totalAnswers}
            </h2>
            <div className="space-y-2 mb-6">
              <p>
                Song Names: {totalCorrect.songName} / {results.length}
              </p>
              <p>
                Original Artists: {totalCorrect.originalArtist} /{" "}
                {results.length}
              </p>
              <p>
                Cover Styles: {totalCorrect.coverStyle} / {results.length}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {results.map((result, idx) => {
              const question = questions[result.questionIndex];
              return (
                <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Question {idx + 1}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="font-semibold">Song Name</p>
                      <p
                        className={
                          result.correct.songName
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        Your answer: {result.answer.songName}
                      </p>
                      {!result.correct.songName && (
                        <p className="text-gray-600">
                          Correct: {question.correctAnswers.songName}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">Original Artist</p>
                      <p
                        className={
                          result.correct.originalArtist
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        Your answer: {result.answer.originalArtist}
                      </p>
                      {!result.correct.originalArtist && (
                        <p className="text-gray-600">
                          Correct: {question.correctAnswers.originalArtist}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">Cover Style</p>
                      <p
                        className={
                          result.correct.coverStyle
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        Your answer: {result.answer.coverStyle}
                      </p>
                      {!result.correct.coverStyle && (
                        <p className="text-gray-600">
                          Correct: {question.correctAnswers.coverStyle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleQuizRestart}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Music Quiz</h1>
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            {isPlaying && (
              <iframe
                key={`${currentQuestion}-${videoKey}`}
                ref={iframeRef}
                width="0"
                height="0"
                src={`https://www.youtube.com/embed/${question.youtubeId}?autoplay=1`}
                title="YouTube audio player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: 0, position: "absolute", left: "-9999px" }}
              />
            )}
            <div className="flex flex-col items-center justify-center gap-4 p-6 bg-gray-100 rounded-lg">
              <div className="flex gap-3">
                {!isPlaying ? (
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
                  >
                    ▶ Play
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handlePause}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      ⏸ Pause
                    </button>
                    <button
                      type="button"
                      onClick={handleRestartAudio}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      ⏮ Restart
                    </button>
                  </>
                )}
              </div>
              {isPlaying && (
                <p className="text-gray-500">🎵 Audio playing...</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="songName"
                className="block text-sm font-medium mb-2"
              >
                Song Name
              </label>
              <input
                type="text"
                id="songName"
                value={answers.songName}
                onChange={(e) =>
                  setAnswers({ ...answers, songName: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="originalArtist"
                className="block text-sm font-medium mb-2"
              >
                Original Artist
              </label>
              <input
                type="text"
                id="originalArtist"
                value={answers.originalArtist}
                onChange={(e) =>
                  setAnswers({ ...answers, originalArtist: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="coverStyle"
                className="block text-sm font-medium mb-2"
              >
                Cover Style (Artist)
              </label>
              <input
                type="text"
                id="coverStyle"
                value={answers.coverStyle}
                onChange={(e) =>
                  setAnswers({ ...answers, coverStyle: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentQuestion < questions.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
