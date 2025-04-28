
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import type { Question, Answer, Language, TranslatedText } from '@/types/quiz';
import type { UserProfile } from '@/types/user'; // Import UserProfile
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ReviewAnswersDialog } from './review-answers-dialog';
import { Loader2, Languages, ArrowLeft, ArrowRight, CheckCircle, XCircle, Repeat, ListChecks, LayoutDashboard, Trophy, AlertTriangle, Zap, Lock } from 'lucide-react'; // Added Zap, Lock
import { translateText } from '@/services/translation'; // Assuming this service exists
import { saveQuizResult } from '@/lib/firebase/firestore'; // Import firestore function
import type { QuizResult } from '@/types/user';
import { useRouter } from 'next/navigation'; // For redirecting after submit
import { Alert } from '../ui/alert';
import { UpgradeAlertDialog } from '../dashboard/UpgradeAlertDialog'; // Import UpgradeAlertDialog

interface QuizClientProps {
  questions: Question[];
  userId: string | null; // Receive user ID as prop
  userProfile: UserProfile | null; // Receive user profile
  onQuizSubmit: () => Promise<void>; // Callback for after submission
}

export function QuizClient({ questions, userId, userProfile, onQuizSubmit }: QuizClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId: selectedAnswerText (in current language) }
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, TranslatedText>>({}); // Cache for dynamic translations
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submission
  const [finalAnswers, setFinalAnswers] = useState<Answer[]>([]); // Will store answers with text
  const [showReview, setShowReview] = useState(false);
  const [showUpgradeReviewDialog, setShowUpgradeReviewDialog] = useState(false); // State for upgrade dialog

  const { toast } = useToast();
  const router = useRouter();

  // Handle the case where no questions are provided (e.g., error during fetch)
   if (!questions || questions.length === 0) {
      return (
          <div className="flex flex-1 items-center justify-center p-4 text-center">
             <Alert variant="destructive" className="max-w-lg">
                <AlertTriangle className="h-4 w-4" />
                <CardTitle>Quiz Error</CardTitle>
                <CardDescription>
                    No questions were loaded for this quiz. Please try again later or contact support.
                 </CardDescription>
             </Alert>
          </div>
      );
   }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const isFreeUser = !userProfile || userProfile.subscription === 'free'; // Determine if user is on free plan or guest


  // --- Translation Handling ---
  const getTranslatedText = (textObj: TranslatedText | string): string => {
     if (typeof textObj === 'string') return textObj;
     return textObj?.[language] || '';
   };

  const getTranslatedOptions = (optionsObj: Question['options']): string[] => {
    return optionsObj?.[language] || [];
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

    // Construct the final answers array including the text of questions and answers
    const constructedAnswers: Answer[] = questions.map(q => {
        const selectedAnswerText = selectedAnswers[q.id];
        const currentQuestionText = q.question?.[language] || 'Question Text N/A';
        const correctAnswerText = q.correctAnswer?.[language] || 'Correct Answer N/A';
        const isCorrect = !!selectedAnswerText && selectedAnswerText === correctAnswerText;
        if (isCorrect) {
            calculatedScore++;
        }
        return {
            questionId: q.id,
            questionText: currentQuestionText,
            selectedAnswer: selectedAnswerText || "Not Answered",
            correctAnswerText: correctAnswerText,
            isCorrect: isCorrect,
        };
    });

    setFinalAnswers(constructedAnswers);
    const finalScore = calculatedScore;
    setScore(finalScore);

    const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

    if (userId) {
      const resultData: Omit<QuizResult, 'id' | 'completedAt'> = {
        userId: userId,
        score: finalScore,
        totalQuestions: totalQuestions,
        percentage: percentage,
        answers: constructedAnswers,
      };
      try {
        await saveQuizResult(resultData);
        try {
            await onQuizSubmit(); // Call usage update after successful save
            console.log("Quiz usage updated successfully after result save.");
        } catch (usageError) {
             console.error("Failed to update quiz usage after saving result:", usageError);
        }
        toast({
          title: "Quiz Submitted!",
          description: `Your result: ${finalScore}/${totalQuestions} (${percentage}%). It has been saved.`,
        });
      } catch (error) {
        console.error("Failed to save quiz result:", error);
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: "Could not save your quiz result. Please try again.",
        });
      } finally {
         setQuizFinished(true);
         setIsSubmitting(false);
      }
    } else {
         toast({
           title: "Quiz Submitted!",
           description: `Your result: ${finalScore}/${totalQuestions} (${percentage}%). Log in to save results.`,
         });
         setQuizFinished(true);
         setIsSubmitting(false);
     }
  };

  const restartQuiz = () => {
     window.location.href = '/quiz';
  };

   const handleReviewClick = () => {
       if (isFreeUser) {
           setShowUpgradeReviewDialog(true); // Show upgrade dialog for free users
       } else {
           setShowReview(true); // Show review dialog for paid users
       }
   };

   const handleUpgradeClick = () => {
        router.push('/pricing');
   };


  // --- Memoized values for performance ---
  const currentQuestionTextMemo = useMemo(() => getTranslatedText(currentQuestion?.question), [currentQuestion, language, translations]);
  const currentOptions = useMemo(() => getTranslatedOptions(currentQuestion?.options), [currentQuestion, language, translations]);

  // --- Render Logic ---

  if (quizFinished) {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const performanceMessage = percentage >= 70 ? "Excellent work!" : percentage >= 50 ? "Good effort, keep practicing!" : "Keep practicing to improve!";

    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full p-4 md:p-8">
        <Card className="w-full max-w-xl text-center p-6 md:p-10 rounded-xl shadow-lg border bg-card"> {/* Increased max-w */}
          <CardHeader className="mb-4">
             <Trophy className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">Quiz Completed!</CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">
               Here's how you performed:
            </CardDescription>
          </CardHeader>
          <CardContent className="mb-6 space-y-4">
             <div className="text-4xl font-bold text-foreground">
               {score} / {totalQuestions}
             </div>
             <div className="text-lg font-medium text-foreground/80">
                ({percentage}%)
             </div>
             <Progress value={percentage} className="w-full h-2.5 mt-2" />
             <p className="mt-4 text-lg text-muted-foreground">{performanceMessage}</p>
             {!userId && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                   Log in or register to save your results and track progress.
                </p>
             )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center items-stretch gap-3 flex-wrap"> {/* Use items-stretch */}
            <Button onClick={restartQuiz} variant="outline" size="lg" className="flex-1 min-w-[150px]"> {/* Ensure buttons can grow */}
               <Repeat className="mr-2 h-4 w-4" /> Take Another Quiz
            </Button>
             {/* Conditionally render Review button or Upgrade dialog trigger */}
             <Button onClick={handleReviewClick} size="lg" className="flex-1 min-w-[150px]">
                 <ListChecks className="mr-2 h-4 w-4" /> Review Answers
             </Button>
            {userId && (
                <Button onClick={() => router.push('/dashboard')} variant="secondary" size="lg" className="flex-1 min-w-[150px]">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Button>
            )}
          </CardFooter>
        </Card>
        {/* Only render ReviewAnswersDialog if user is not free OR if it's allowed for free (if logic changes) */}
        {!isFreeUser && (
             <ReviewAnswersDialog
                 isOpen={showReview}
                 onClose={() => setShowReview(false)}
                 answers={finalAnswers}
                 questions={questions}
                 language={language}
              />
        )}
         {/* Render Upgrade Dialog for Free Users */}
         <UpgradeAlertDialog
              isOpen={showUpgradeReviewDialog}
              onClose={() => setShowUpgradeReviewDialog(false)}
              triggerButton={null} // Triggered programmatically
              featureName="Answer Review"
              onUpgradeClick={handleUpgradeClick}
          />
      </div>
    );
  }

  // Quiz Interface
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full p-4 md:p-8">
      <Card className="w-full max-w-2xl rounded-xl shadow-lg border overflow-hidden">
        <CardHeader className="p-6 bg-muted/30 border-b">
           <div className="flex justify-between items-center mb-3">
            <CardDescription className="text-sm font-medium text-primary">
               {currentQuestion?.category || 'General'}
            </CardDescription>
             <Button
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating || isSubmitting}
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
             {`Q${currentQuestionIndex + 1}: ${currentQuestionTextMemo || 'Loading...'}`}
          </CardTitle>
           <Progress value={progress} className="w-full mt-4 h-1.5" />
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <RadioGroup
            value={selectedAnswers[currentQuestion?.id || ''] || ''}
            onValueChange={handleOptionSelect}
            className="space-y-4"
            aria-label="Choose an answer"
            disabled={isSubmitting}
          >
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
                     disabled={isSubmitting}
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
        onClick={handleReviewClick} // Use the combined handler
        disabled={!Object.keys(selectedAnswers).length || isSubmitting}
      >
        Review Answers
      </Button>
       {/* Render Review Dialog only if needed and allowed */}
        {!isFreeUser && (
            <ReviewAnswersDialog
                isOpen={showReview && !quizFinished} // Only open if !isFreeUser
                onClose={() => setShowReview(false)}
                 answers={Object.entries(selectedAnswers).map(([qId, selAns]) => {
                    const question = questions.find(q => q.id === qId);
                    const correctAnsText = question?.correctAnswer?.[language] || '';
                    const questionTextInReviewLang = question?.question?.[language] || '';
                    const isCorrect = !!question && !!selAns && correctAnsText === selAns;
                    return {
                      questionId: qId,
                      questionText: questionTextInReviewLang,
                      selectedAnswer: selAns,
                      correctAnswerText: correctAnsText,
                      isCorrect: isCorrect
                    };
                  })}
                questions={questions}
                language={language}
            />
        )}
         {/* Render Upgrade Dialog, always available */}
        <UpgradeAlertDialog
             isOpen={showUpgradeReviewDialog}
             onClose={() => setShowUpgradeReviewDialog(false)}
             triggerButton={null} // Triggered programmatically
             featureName="Answer Review"
             onUpgradeClick={handleUpgradeClick}
         />
    </div>
  );
}
