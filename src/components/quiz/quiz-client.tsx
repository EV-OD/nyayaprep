'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import type { Question, Answer, Language, TranslatedText } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ReviewAnswersDialog } from './review-answers-dialog';
import { Loader2, Languages, ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { translateText } from '@/services/translation'; // Assuming this service exists

interface QuizClientProps {
  questions: Question[];
}

export function QuizClient({ questions }: QuizClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId: selectedAnswerText }
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, TranslatedText>>({}); // Cache for dynamic translations
  const [isTranslating, setIsTranslating] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<Answer[]>([]);
  const [showReview, setShowReview] = useState(false);

  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // --- Translation Handling ---

  // Function to get translated text, preferring cached/original over API call
  const getTranslatedText = (textObj: TranslatedText): string => {
    return textObj[language];
  };

  const getTranslatedOptions = (optionsObj: Question['options']): string[] => {
    return optionsObj[language];
  }

  // Function to toggle language and potentially fetch translations
  const handleTranslate = async () => {
    setIsTranslating(true);
    const newLanguage = language === 'en' ? 'ne' : 'en';
    try {
      // Simulate dynamic translation if needed - For now, we rely on pre-translated data
      // Example: If only 'en' existed initially, you'd call translateText here for all elements
      // For simplicity, assuming `questions` prop already contains both 'en' and 'ne'
       await new Promise(res => setTimeout(res, 300)); // Simulate delay
      setLanguage(newLanguage);
       toast({
          title: "Language Switched",
          description: `Content is now displayed in ${newLanguage === 'en' ? 'English' : 'Nepali'}.`,
        });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        variant: "destructive",
        title: "Translation Failed",
        description: "Could not switch language. Please try again.",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // --- Quiz Logic ---

  const handleOptionSelect = (value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

 const handleSubmit = () => {
    let calculatedScore = 0;
    const answers: Answer[] = questions.map(q => {
      const selected = selectedAnswers[q.id];
      const correct = q.correctAnswer[language]; // Compare with correct answer in the *current* language
      const isCorrect = selected === correct;
      if (isCorrect) {
        calculatedScore++;
      }
      return {
        questionId: q.id,
        selectedAnswer: selected || "Not Answered", // Handle unanswered
        isCorrect: isCorrect,
      };
    });

    setFinalAnswers(answers);
    setScore(calculatedScore);
    setQuizFinished(true);
    toast({
      title: "Quiz Submitted!",
      description: `You scored ${calculatedScore} out of ${totalQuestions}.`,
    });
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setScore(0);
    setFinalAnswers([]);
    setLanguage('en'); // Reset language
    toast({
      title: "Quiz Restarted",
      description: "Good luck!",
    });
  };

  // --- Memoized values for performance ---
  const currentQuestionText = useMemo(() => getTranslatedText(currentQuestion.question), [currentQuestion, language, translations]);
  const currentOptions = useMemo(() => getTranslatedOptions(currentQuestion.options), [currentQuestion, language, translations]);
  const currentCorrectAnswer = useMemo(() => getTranslatedText(currentQuestion.correctAnswer), [currentQuestion, language, translations]);


  // --- Render Logic ---

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-muted/50">
        <Card className="w-full max-w-md text-center p-6 md:p-8 rounded-xl shadow-lg border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary mb-2">Quiz Completed!</CardTitle>
            <CardDescription className="text-lg text-foreground/80">
              Your Score: <span className="font-semibold text-foreground">{score} / {totalQuestions}</span>
            </CardDescription>
             <Progress value={(score / totalQuestions) * 100} className="w-full mt-4 h-2" />
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              {score / totalQuestions > 0.7 ? "Great job!" : "Keep practicing!"}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={restartQuiz} variant="outline" size="lg">
              Restart Quiz
            </Button>
             <Button onClick={() => setShowReview(true)} size="lg">Review Answers</Button>
          </CardFooter>
        </Card>
         <ReviewAnswersDialog
            isOpen={showReview}
            onClose={() => setShowReview(false)}
            answers={finalAnswers}
            questions={questions}
            language={language} // Pass current language
          />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-muted/50">
      <Card className="w-full max-w-2xl rounded-xl shadow-lg border overflow-hidden">
        <CardHeader className="p-6 bg-muted/30 border-b">
           <div className="flex justify-between items-center mb-3">
            <CardDescription className="text-sm font-medium text-primary">
              {getTranslatedText(currentQuestion.category ? {en: currentQuestion.category, ne: currentQuestion.category} : {en: "General", ne: "सामान्य"})} {/* Simple fallback */}
            </CardDescription>
             <Button
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {isTranslating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Languages className="h-4 w-4" />
              )}
              {language === 'en' ? 'नेपाली' : 'English'}
            </Button>
          </div>
          <CardTitle className="text-xl md:text-2xl font-semibold leading-tight">
            {`Q${currentQuestionIndex + 1}: ${currentQuestionText}`}
          </CardTitle>
           <Progress value={progress} className="w-full mt-4 h-1.5" />
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <RadioGroup
            value={selectedAnswers[currentQuestion.id] || ''}
            onValueChange={handleOptionSelect}
            className="space-y-4"
            aria-label="Choose an answer"
          >
            {currentOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-input bg-background hover:bg-accent/50 transition-colors has-[:checked]:bg-accent has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                <RadioGroupItem
                  value={option}
                  id={`${currentQuestion.id}-option-${index}`}
                  className="h-5 w-5"
                 />
                <Label
                  htmlFor={`${currentQuestion.id}-option-${index}`}
                  className="text-base font-normal flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>

        <CardFooter className="p-6 bg-muted/30 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              aria-label="Previous Question"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button onClick={handleNext} aria-label="Next Question">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
               <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="default" aria-label="Submit Quiz" className="bg-primary hover:bg-primary/90">
                     <CheckCircle className="mr-2 h-4 w-4" />
                     Submit
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit your answers? You cannot change them after submission.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                      Submit Quiz
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardFooter>
      </Card>
       <Button
        variant="link"
        className="mt-6 text-muted-foreground hover:text-primary"
        onClick={() => setShowReview(true)}
        disabled={!Object.keys(selectedAnswers).length} // Only enable if some answers exist
      >
        Review Answers
      </Button>
        <ReviewAnswersDialog
          isOpen={showReview && !quizFinished} // Only show review in-progress if not finished
          onClose={() => setShowReview(false)}
          answers={Object.entries(selectedAnswers).map(([qId, selAns]) => ({
             questionId: qId,
             selectedAnswer: selAns,
             isCorrect: questions.find(q => q.id === qId)?.correctAnswer[language] === selAns // Provisional correctness
           }))}
          questions={questions}
          language={language}
        />
    </div>
  );
}
