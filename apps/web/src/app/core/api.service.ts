import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Curso = {
  id: number;
  nombre: string;
};

export type AlumnoUser = {
  id: number;
  email?: string | null;
  username?: string | null;
};

export type Alumno = {
  id: number;
  nombre: string;
  cursoId: number;
  userId: number;
  user?: AlumnoUser;
  curso?: Curso;
};

export type AvisoCategoria = 'INSTITUCIONAL' | 'ADMINISTRATIVO' | 'ACADEMICO';

export type Aviso = {
  id: number;
  titulo: string;
  contenido: string;
  categoria: AvisoCategoria;
  publicadoDesde: string;
  activo: boolean;
};

export type Nota = {
  id: number;
  alumnoId: number;
  cursoId: number;
  valor: number;
  descripcion: string;
  fecha: string;
  alumno: Alumno;
  curso: Curso;
};

export type Asistencia = {
  id: number;
  alumnoId: number;
  cursoId: number;
  presente: boolean;
  fecha: string;
  observacion?: string | null;
  alumno: Alumno;
  curso: Curso;
};

export type CreateNotaInput = {
  valor: number;
  descripcion?: string;
  fecha?: string;
  alumnoId: number;
  cursoId: number;
};

export type UpdateNotaInput = Partial<CreateNotaInput>;

export type CreateAsistenciaInput = {
  fecha: string;
  presente?: boolean;
  observacion?: string;
  alumnoId: number;
  cursoId: number;
};

export type UpdateAsistenciaInput = Partial<CreateAsistenciaInput>;

export type CreateAvisoInput = {
  titulo: string;
  contenido: string;
  categoria?: AvisoCategoria;
  publicadoDesde?: string;
  activo?: boolean;
};

export type UpdateAvisoInput = Partial<CreateAvisoInput>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiBase = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiBase}/cursos`);
  }

  getAlumnos(cursoId?: number | null): Observable<Alumno[]> {
    let params = new HttpParams();
    if (cursoId) {
      params = params.set('cursoId', String(cursoId));
    }

    return this.http.get<Alumno[]>(`${this.apiBase}/alumnos`, { params });
  }

  getNotas(filters: { cursoId?: number | null; alumnoId?: number | null }): Observable<Nota[]> {
    let params = new HttpParams();
    if (filters.cursoId) params = params.set('cursoId', String(filters.cursoId));
    if (filters.alumnoId) params = params.set('alumnoId', String(filters.alumnoId));

    return this.http.get<Nota[]>(`${this.apiBase}/notas`, { params });
  }

  createNota(input: CreateNotaInput): Observable<Nota> {
    return this.http.post<Nota>(`${this.apiBase}/notas`, input);
  }

  updateNota(id: number, input: UpdateNotaInput): Observable<Nota> {
    return this.http.patch<Nota>(`${this.apiBase}/notas/${id}`, input);
  }

  deleteNota(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiBase}/notas/${id}`);
  }

  getAsistencias(filters: { cursoId?: number | null; alumnoId?: number | null }): Observable<Asistencia[]> {
    let params = new HttpParams();
    if (filters.cursoId) params = params.set('cursoId', String(filters.cursoId));
    if (filters.alumnoId) params = params.set('alumnoId', String(filters.alumnoId));

    return this.http.get<Asistencia[]>(`${this.apiBase}/asistencias`, { params });
  }

  createAsistencia(input: CreateAsistenciaInput): Observable<Asistencia> {
    return this.http.post<Asistencia>(`${this.apiBase}/asistencias`, input);
  }

  updateAsistencia(id: number, input: UpdateAsistenciaInput): Observable<Asistencia> {
    return this.http.patch<Asistencia>(`${this.apiBase}/asistencias/${id}`, input);
  }

  deleteAsistencia(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiBase}/asistencias/${id}`);
  }

  getAvisos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(`${this.apiBase}/avisos`);
  }

  createAviso(input: CreateAvisoInput): Observable<Aviso> {
    return this.http.post<Aviso>(`${this.apiBase}/avisos`, input);
  }

  updateAviso(id: number, input: UpdateAvisoInput): Observable<Aviso> {
    return this.http.patch<Aviso>(`${this.apiBase}/avisos/${id}`, input);
  }

  deleteAviso(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiBase}/avisos/${id}`);
  }
}
