
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
import { auth } from '@/lib/firebase/config'; // Import auth
import { saveQuizResult } from '@/lib/firebase/firestore'; // Import firestore function
import type { QuizResult } from '@/types/user';
import { useRouter } from 'next/navigation'; // For redirecting after submit

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
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submission
  const [finalAnswers, setFinalAnswers] = useState<Answer[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Store current user's ID

  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  // Get current user ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);


  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // --- Translation Handling ---
  const getTranslatedText = (textObj: TranslatedText | string): string => {
     // Handle cases where category might just be a string
     if (typeof textObj === 'string') return textObj;
     return textObj?.[language] || ''; // Add null check
   };

  const getTranslatedOptions = (optionsObj: Question['options']): string[] => {
    return optionsObj?.[language] || []; // Add null check
  }

  const handleTranslate = async () => {
    setIsTranslating(true);
    const newLanguage = language === 'en' ? 'ne' : 'en';
    try {
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

 const handleSubmit = async () => {
    setIsSubmitting(true);
    let calculatedScore = 0;
    const answers: Answer[] = questions.map(q => {
      const selected = selectedAnswers[q.id];
      // Ensure correctAnswer is accessed safely and in the correct language
      const correct = q.correctAnswer?.[language];
      const isCorrect = !!selected && selected === correct; // Ensure selected is not undefined
      if (isCorrect) {
        calculatedScore++;
      }
      return {
        questionId: q.id,
        selectedAnswer: selected || "Not Answered",
        isCorrect: isCorrect,
      };
    });

    setFinalAnswers(answers);
    const finalScore = calculatedScore;
    setScore(finalScore);

    const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;


    // Save result to Firestore if user is logged in
    if (currentUserId) {
      const resultData: Omit<QuizResult, 'id' | 'completedAt'> = { // Exclude id and completedAt (serverTimestamp used)
        userId: currentUserId,
        score: finalScore,
        totalQuestions: totalQuestions,
        percentage: percentage,
        answers: answers,
        // completedAt will be set by Firestore serverTimestamp in saveQuizResult
      };
      try {
        await saveQuizResult(resultData);
        toast({
          title: "Quiz Submitted!",
          description: `Your result: ${finalScore}/${totalQuestions} (${percentage}%). It has been saved.`,
        });
        // Redirect to dashboard after successful save
        router.push('/dashboard');

      } catch (error) {
        console.error("Failed to save quiz result:", error);
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: "Could not save your quiz result. Please try again.",
        });
        // Still show the result page even if saving failed
        setQuizFinished(true);
        setIsSubmitting(false);
      }
    } else {
         // User not logged in, just show results locally
         toast({
           title: "Quiz Submitted!",
           description: `Your result: ${finalScore}/${totalQuestions} (${percentage}%). Log in to save results.`,
         });
         setQuizFinished(true);
         setIsSubmitting(false);
     }
     // Note: setQuizFinished(true) is called inside the try/catch or else block
     // to ensure it only happens after the save attempt (or if not logged in)
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setScore(0);
    setFinalAnswers([]);
    setLanguage('en'); // Reset language
    setIsSubmitting(false);
    toast({
      title: "Quiz Restarted",
      description: "Good luck!",
    });
  };

  // --- Memoized values for performance ---
  const currentQuestionText = useMemo(() => getTranslatedText(currentQuestion?.question), [currentQuestion, language, translations]);
  const currentOptions = useMemo(() => getTranslatedOptions(currentQuestion?.options), [currentQuestion, language, translations]);
  // currentCorrectAnswer is calculated inside handleSubmit now

  // --- Render Logic ---

  if (quizFinished) {
    // Result display remains the same
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-muted/50">
        <Card className="w-full max-w-md text-center p-6 md:p-8 rounded-xl shadow-lg border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary mb-2">Quiz Completed!</CardTitle>
            <CardDescription className="text-lg text-foreground/80">
              Your Score: <span className="font-semibold text-foreground">{score} / {totalQuestions}</span>
               ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
            </CardDescription>
             <Progress value={totalQuestions > 0 ? (score / totalQuestions) * 100 : 0} className="w-full mt-4 h-2" />
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
               {totalQuestions > 0 && (score / totalQuestions) > 0.7 ? "Great job!" : "Keep practicing!"}
               {!currentUserId && " Log in or register to save your results."}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={restartQuiz} variant="outline" size="lg">
              Restart Quiz
            </Button>
             <Button onClick={() => setShowReview(true)} size="lg">Review Answers</Button>
             {currentUserId && (
                 <Button onClick={() => router.push('/dashboard')} variant="secondary" size="lg">Go to Dashboard</Button>
             )}
          </CardFooter>
        </Card>
         <ReviewAnswersDialog
            isOpen={showReview}
            onClose={() => setShowReview(false)}
            answers={finalAnswers}
            questions={questions}
            language={language}
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
               {/* Ensure category is handled correctly */}
               {currentQuestion?.category || 'General'}
            </CardDescription>
             <Button
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating || isSubmitting} // Disable during translation/submission
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
             {/* Add loading state for question text if needed */}
             {`Q${currentQuestionIndex + 1}: ${currentQuestionText || 'Loading...'}`}
          </CardTitle>
           <Progress value={progress} className="w-full mt-4 h-1.5" />
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <RadioGroup
            value={selectedAnswers[currentQuestion?.id || ''] || ''}
            onValueChange={handleOptionSelect}
            className="space-y-4"
            aria-label="Choose an answer"
            disabled={isSubmitting} // Disable options during submission
          >
             {/* Add check for currentOptions before mapping */}
             {currentOptions && currentOptions.length > 0 ? currentOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-input bg-background hover:bg-accent/50 transition-colors has-[:checked]:bg-accent has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                <RadioGroupItem
                  value={option}
                  id={`${currentQuestion?.id}-option-${index}`}
                  className="h-5 w-5"
                  disabled={isSubmitting}
                 />
                <Label
                  htmlFor={`${currentQuestion?.id}-option-${index}`}
                  className="text-base font-normal flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            )) : <p className="text-muted-foreground">Loading options...</p>}
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
              disabled={currentQuestionIndex === 0 || isSubmitting}
              aria-label="Previous Question"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button onClick={handleNext} aria-label="Next Question" disabled={isSubmitting}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
               <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button
                     variant="default"
                     aria-label="Submit Quiz"
                     className="bg-primary hover:bg-primary/90"
                     disabled={isSubmitting} // Disable submit button during submission
                   >
                     {isSubmitting ? (
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                       <CheckCircle className="mr-2 h-4 w-4" />
                     )}
                     {isSubmitting ? 'Submitting...' : 'Submit'}
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
                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                       {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       ) : null}
                       {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
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
        disabled={!Object.keys(selectedAnswers).length || isSubmitting} // Disable during submission
      >
        Review Answers
      </Button>
        <ReviewAnswersDialog
          isOpen={showReview && !quizFinished} // Only show review in-progress if not finished
          onClose={() => setShowReview(false)}
          // Calculate provisional answers for review dialog
           answers={Object.entries(selectedAnswers).map(([qId, selAns]) => {
             const question = questions.find(q => q.id === qId);
             const isCorrect = !!question && !!selAns && question.correctAnswer?.[language] === selAns;
             return {
               questionId: qId,
               selectedAnswer: selAns,
               isCorrect: isCorrect
             };
           })}
          questions={questions}
          language={language}
        />
    </div>
  );
}
