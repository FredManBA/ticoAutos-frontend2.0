import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuestionService } from '../../../core/services/question.service';
import { GraphQLService } from '../../../core/services/graphql.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuestionResponse } from '../../../core/models/vehicle.models';

function noContactInfoValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  const hasEmail = /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/i.test(value);
  const hasPhone = /(^|\D)(?:\+?506[\s.-]?)?\d{4}[\s.-]?\d{4}($|\D)/.test(value);
  const hasLink = /(?:https?:\/\/|www\.|wa\.me\/)/i.test(value);

  return hasEmail || hasPhone || hasLink ? { contactInfo: true } : null;
}

const GET_QUESTIONS_BY_VEHICLE = `
  query GetQuestionsByVehicle($vehicleId: Int!) {
    questionsByVehicle(vehicleId: $vehicleId) {
      id content createdAt vehicleId askerId askerName
      answer { id content createdAt }
    }
  }
`;

@Component({
  selector: 'app-vehicle-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vehicle-questions.component.html'
})
export class VehicleQuestionsComponent implements OnInit {
  private questionService = inject(QuestionService);
  private graphql = inject(GraphQLService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  @Input() vehicleId!: number;
  @Input() ownerId!: number;

  questions: QuestionResponse[] = [];
  loading = true;
  submitting = false;
  answeringId: number | null = null;
  questionError = '';
  answerError = '';

  questionForm = this.fb.group({
    content: ['', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(500),
      noContactInfoValidator
    ]]
  });

  answerForm = this.fb.group({
    content: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(500),
      noContactInfoValidator
    ]]
  });

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get currentUserId(): number | null {
    const token = this.authService.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload.id);
    } catch {
      return null;
    }
  }

  get isOwner(): boolean {
    return this.currentUserId === this.ownerId;
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.graphql
      .query<{ questionsByVehicle: QuestionResponse[] }>(GET_QUESTIONS_BY_VEHICLE, {
        vehicleId: this.vehicleId
      })
      .subscribe({
        next: (data) => {
          this.questions = data.questionsByVehicle;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  onAsk(): void {
    this.questionError = '';
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.questionService.ask(this.vehicleId, this.questionForm.value.content!).subscribe({
      next: () => {
        this.questionForm.reset();
        this.submitting = false;
        this.loadQuestions();
      },
      error: (err) => {
        this.questionError = this.getErrorMessage(err) || 'No fue posible enviar la pregunta.';
        this.submitting = false;
      }
    });
  }

  onShowAnswerForm(questionId: number): void {
    this.answeringId = questionId;
    this.answerError = '';
    this.answerForm.reset();
  }

  onAnswer(questionId: number): void {
    this.answerError = '';
    if (this.answerForm.invalid) {
      this.answerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.questionService.answer(questionId, this.answerForm.value.content!).subscribe({
      next: () => {
        this.answeringId = null;
        this.answerForm.reset();
        this.submitting = false;
        this.loadQuestions();
      },
      error: (err) => {
        this.answerError = this.getErrorMessage(err) || 'No fue posible enviar la respuesta.';
        this.submitting = false;
      }
    });
  }

  private getErrorMessage(err: any): string {
    const errors = err.error?.errors;
    if (errors) {
      const firstKey = Object.keys(errors)[0];
      const firstError = firstKey ? errors[firstKey]?.[0] : null;
      if (firstError) return firstError;
    }

    return err.error?.message || '';
  }
}
