export interface Question {
  youtubeId: string;
  correctAnswers: {
    songName: string;
    originalArtist: string;
    coverStyle: string;
  };
}

export interface Answer {
  songName: string;
  originalArtist: string;
  coverStyle: string;
}

export interface QuestionResult {
  questionIndex: number;
  answer: Answer;
  correct: {
    songName: boolean;
    originalArtist: boolean;
    coverStyle: boolean;
  };
}
