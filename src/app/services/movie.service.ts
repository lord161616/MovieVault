
import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore';

import { db } from '../core/firebase/firebase.config';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private readonly moviesCollection = collection(db, 'movies');

  constructor() {}

  /**
   * CREATE
   * Adds a new movie to Firestore.
   */
  async createMovie(movie: Movie): Promise<string> {
    const { id, ...movieData } = movie;

    const documentReference = await addDoc(
      this.moviesCollection,
      movieData
    );

    return documentReference.id;
  }

  /**
   * READ
   * Retrieves all movies from Firestore.
   */
  async getMovies(): Promise<Movie[]> {
    const snapshot = await getDocs(this.moviesCollection);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    })) as Movie[];
  }

  /**
   * UPDATE
   * Updates an existing movie.
   */
  async updateMovie(
    movieId: string,
    movie: Partial<Movie>
  ): Promise<void> {
    const movieReference = doc(
      db,
      'movies',
      movieId
    );

    const { id, ...movieData } = movie;

    await updateDoc(
      movieReference,
      movieData
    );
  }

  /**
   * DELETE
   * Deletes a movie from Firestore.
   */
  async deleteMovie(movieId: string): Promise<void> {
    const movieReference = doc(
      db,
      'movies',
      movieId
    );

    await deleteDoc(movieReference);
  }
}

