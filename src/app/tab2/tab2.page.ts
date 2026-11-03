
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonModal,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/angular';

import { MovieService } from '../services/movie.service';
import { Movie, MovieStatus } from '../models/movie.model';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonLoading,
    IonModal,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTitle,
    IonToast,
    IonToolbar
  ]
})
export class Tab2Page implements OnInit {

  movies: Movie[] = [];

  loading = false;

  errorMessage = '';

  searchTerm = '';

  selectedStatus: MovieStatus | 'All' = 'All';

  isEditModalOpen = false;

  toastMessage = '';

  isToastOpen = false;

  // ============================================================
  // UPDATE STATE
  // ============================================================

  editingMovieId: string | null = null;

  editMovie: Movie = this.createEmptyMovie();

  updating = false;

  updateMessage = '';

  // ============================================================
  // DELETE STATE
  // ============================================================

  deletingMovieId: string | null = null;

  deleteMessage = '';

  constructor(
    private readonly movieService: MovieService,
    private readonly ngZone: NgZone,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly alertController: AlertController
  ) {}

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  async ngOnInit(): Promise<void> {
    await this.loadMovies();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadMovies();
  }

  // ============================================================
  // READ
  // ============================================================

  async loadMovies(): Promise<void> {

    console.log('Starting movie load...');

    this.loading = true;
    this.errorMessage = '';

    try {

      const movies =
        await this.movieService.getMovies();

      console.log('Movies loaded:', movies);

      this.ngZone.run(() => {
        this.movies = movies;
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      });

    } catch (error) {

      console.error(
        'Failed to load movies:',
        error
      );

      this.ngZone.run(() => {
        this.errorMessage =
          'Unable to load movies from Firestore.';
        this.showToast(this.errorMessage);
        this.changeDetectorRef.detectChanges();
      });

    } finally {

      this.ngZone.run(() => {
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      });

      console.log(
        'Loading finished. loading =',
        this.loading
      );
    }
  }

  // ============================================================
  // START EDIT
  // ============================================================

  startEdit(movie: Movie): void {

    if (!movie.id) {

      console.error(
        'Cannot edit movie because it has no document ID.'
      );

      this.errorMessage =
        'Unable to edit this movie. Missing document ID.';

      return;
    }

    this.editingMovieId = movie.id;

    this.editMovie = {
      ...movie
    };

    this.updateMessage = '';
    this.errorMessage = '';
    this.isEditModalOpen = true;

    console.log(
      'Editing movie:',
      this.editMovie
    );
  }

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  cancelEdit(): void {

    this.editingMovieId = null;

    this.editMovie = this.createEmptyMovie();

    this.updateMessage = '';

    this.errorMessage = '';
    this.isEditModalOpen = false;

    console.log('Movie edit cancelled.');
  }

  // ============================================================
  // SAVE EDIT
  // ============================================================

  async saveEdit(): Promise<void> {

    if (!this.editingMovieId) {

      this.errorMessage =
        'No movie is currently being edited.';

      return;
    }

    const validationError =
      this.validateMovie(this.editMovie);

    if (validationError) {

      this.errorMessage =
        validationError;

      return;
    }

    this.updating = true;

    this.errorMessage = '';
    this.updateMessage = '';

    try {

      await this.movieService.updateMovie(
        this.editingMovieId,
        {
          title:
            this.editMovie.title.trim(),

          director:
            this.editMovie.director.trim(),

          genre:
            this.editMovie.genre.trim(),

          releaseYear:
            Number(this.editMovie.releaseYear),

          rating:
            Number(this.editMovie.rating),

          status:
            this.editMovie.status
        }
      );

      console.log(
        'Movie updated successfully:',
        this.editingMovieId
      );

      this.updateMessage =
        'Movie updated successfully.';

      await this.loadMovies();

      this.ngZone.run(() => {
        this.editingMovieId = null;
        this.editMovie = this.createEmptyMovie();
        this.isEditModalOpen = false;
        this.showToast('Movie updated successfully.');
        this.changeDetectorRef.detectChanges();
      });

    } catch (error) {

      console.error(
        'Failed to update movie:',
        error
      );

      this.ngZone.run(() => {
        this.errorMessage =
          'Unable to update movie in Firestore.';
        this.showToast(this.errorMessage);
        this.changeDetectorRef.detectChanges();
      });

    } finally {

      this.ngZone.run(() => {
        this.updating = false;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  // ============================================================
  // DELETE MOVIE
  // ============================================================

  async confirmDelete(movie: Movie): Promise<void> {

    // ----------------------------------------------------------
    // VERIFY DOCUMENT ID
    // ----------------------------------------------------------

    if (!movie.id) {

      console.error(
        'Cannot delete movie because it has no document ID.'
      );

      this.errorMessage =
        'Unable to delete this movie. Missing document ID.';

      return;
    }

    // ----------------------------------------------------------
    // PREVENT DELETE DURING ANOTHER DELETE
    // ----------------------------------------------------------

    if (this.deletingMovieId) {

      return;
    }

    // ----------------------------------------------------------
    // SHOW CONFIRMATION
    // ----------------------------------------------------------

    const alert =
      await this.alertController.create({

        header: 'Delete Movie',

        message:
          `Are you sure you want to delete "${movie.title}"? This action cannot be undone.`,

        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',

            handler: () => {

              void this.deleteMovie(movie);
            }
          }
        ]
      });

    await alert.present();
  }

  // ============================================================
  // DELETE MOVIE FROM FIRESTORE
  // ============================================================

  private async deleteMovie(movie: Movie): Promise<void> {

    if (!movie.id) {

      this.errorMessage =
        'Unable to delete this movie. Missing document ID.';

      return;
    }

    // ----------------------------------------------------------
    // SET DELETE STATE
    // ----------------------------------------------------------

    this.deletingMovieId = movie.id;

    this.errorMessage = '';
    this.deleteMessage = '';

    try {

      // --------------------------------------------------------
      // DELETE FROM FIRESTORE
      // --------------------------------------------------------

      await this.movieService.deleteMovie(
        movie.id
      );

      console.log(
        'Movie deleted successfully:',
        movie.id
      );

      // --------------------------------------------------------
      // RELOAD MOVIES
      // --------------------------------------------------------

      await this.loadMovies();

      this.ngZone.run(() => {
        this.deleteMessage =
          'Movie deleted successfully.';

        if (this.editingMovieId === movie.id) {
          this.editingMovieId = null;
          this.editMovie = this.createEmptyMovie();
        }

        this.showToast('Movie deleted successfully.');
        this.changeDetectorRef.detectChanges();
      });

    } catch (error) {

      console.error(
        'Failed to delete movie:',
        error
      );

      this.ngZone.run(() => {
        this.errorMessage =
          'Unable to delete movie from Firestore.';
        this.showToast(this.errorMessage);
        this.changeDetectorRef.detectChanges();
      });

    } finally {

      this.ngZone.run(() => {
        this.deletingMovieId = null;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  // ============================================================
  // VALIDATE MOVIE
  // ============================================================

  private validateMovie(movie: Movie): string {

    if (!movie.title.trim()) {

      return 'Movie title is required.';
    }

    if (!movie.director.trim()) {

      return 'Director is required.';
    }

    if (!movie.genre.trim()) {

      return 'Genre is required.';
    }

    const releaseYear =
      Number(movie.releaseYear);

    if (
      !Number.isInteger(releaseYear) ||
      releaseYear < 1888 ||
      releaseYear > 2100
    ) {

      return 'Release year must be a valid year.';
    }

    const rating =
      Number(movie.rating);

    if (
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 10
    ) {

      return 'Rating must be between 0 and 10.';
    }

    if (
      movie.status !== 'Watching' &&
      movie.status !== 'Watched' &&
      movie.status !== 'Plan to Watch'
    ) {

      return 'Please select a valid movie status.';
    }

    return '';
  }

  // ============================================================
  // CREATE EMPTY MOVIE
  // ============================================================

  private createEmptyMovie(): Movie {

    return {
      title: '',
      director: '',
      genre: '',
      releaseYear:
        new Date().getFullYear(),
      rating: 0,
      status:
        'Plan to Watch' as MovieStatus
    };
  }

  get filteredMovies(): Movie[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    return this.movies.filter((movie) => {
      const matchesStatus =
        this.selectedStatus === 'All' ||
        movie.status === this.selectedStatus;

      const searchableText = [
        movie.title,
        movie.director,
        movie.genre,
        movie.status
      ].join(' ').toLowerCase();

      return matchesStatus && searchableText.includes(normalizedSearch);
    });
  }

  showToast(message: string): void {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  dismissToast(): void {
    this.isToastOpen = false;
  }
}

