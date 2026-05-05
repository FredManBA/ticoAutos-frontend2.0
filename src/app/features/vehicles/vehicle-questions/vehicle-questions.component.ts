import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuestionService } from '../../../core/services/question.service';
import { GraphQLService } from '../../../core/services/graphql.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuestionResponse } from '../../../core/models/vehicle.models';

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

  questionForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(5)]]
  });

  answerForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(3)]]
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
    if (this.questionForm.invalid) return;
    this.submitting = true;
    this.questionService.ask(this.vehicleId, this.questionForm.value.content!).subscribe({
      next: () => {
        this.questionForm.reset();
        this.submitting = false;
        this.loadQuestions();
      },
      error: () => { this.submitting = false; }
    });
  }

  onShowAnswerForm(questionId: number): void {
    this.answeringId = questionId;
    this.answerForm.reset();
  }

  onAnswer(questionId: number): void {
    if (this.answerForm.invalid) return;
    this.submitting = true;
    this.questionService.answer(questionId, this.answerForm.value.content!).subscribe({
      next: () => {
        this.answeringId = null;
        this.answerForm.reset();
        this.submitting = false;
        this.loadQuestions();
      },
      error: () => { this.submitting = false; }
    });
  }
}