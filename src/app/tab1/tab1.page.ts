import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import { MovieService } from '../services/movie.service';
import { MovieStatus } from '../models/movie.model';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonNote,
    IonTitle,
    IonToolbar
  ]
})
export class Tab1Page {

  readonly currentYear = new Date().getFullYear();

  readonly statuses: MovieStatus[] = [
    'Watching',
    'Watched',
    'Plan to Watch'
  ];

  movieForm = this.formBuilder.group({
    title: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    director: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    genre: [
      '',
      [
        Validators.required,
        Validators.maxLength(50)
      ]
    ],

    releaseYear: [
      this.currentYear,
      [
        Validators.required,
        Validators.min(1888),
        Validators.max(this.currentYear)
      ]
    ],

    rating: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(10)
      ]
    ],

    status: [
      'Plan to Watch' as MovieStatus,
      Validators.required
    ]
  });

  isSaving = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly movieService: MovieService
  ) {}

  isInvalid(controlName: string): boolean {
    const control = this.movieForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  async addMovie(): Promise<void> {

    if (this.movieForm.invalid) {
      this.movieForm.markAllAsTouched();
      return;
    }

    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    try {

      const formValue = this.movieForm.getRawValue();

      const movie = {
        title: (formValue.title ?? '').trim(),
        director: (formValue.director ?? '').trim(),
        genre: (formValue.genre ?? '').trim(),
        releaseYear: Number(formValue.releaseYear),
        rating: Number(formValue.rating),
        status: formValue.status as MovieStatus
      };

      const movieId =
        await this.movieService.createMovie(movie);

      console.log(
        'Movie successfully created:',
        movieId
      );

      alert('Movie added successfully!');

      this.movieForm.reset({
        title: '',
        director: '',
        genre: '',
        releaseYear: this.currentYear,
        rating: 0,
        status: 'Plan to Watch'
      });

    } catch (error) {

      console.error(
        'Failed to create movie:',
        error
      );

      alert(
        'Failed to add movie. Check the browser console for details.'
      );

    } finally {

      this.isSaving = false;

    }
  }
}