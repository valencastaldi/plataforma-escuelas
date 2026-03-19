import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  ApiService,
  Alumno,
  Asistencia,
  CreateAsistenciaInput,
  CreateNotaInput,
  Curso,
  Nota,
  UpdateAsistenciaInput,
  UpdateNotaInput,
} from '../core/api.service';
import { AuthService, AuthUser, UserRole } from '../core/auth.service';
import { ModalService, ModalType, FormField } from '../core/modal.service';

type Vista = 'resumen' | 'notas' | 'asistencias' | 'alumnos' | 'cursos';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  protected readonly vistas: ReadonlyArray<Vista> = ['resumen', 'notas', 'asistencias', 'alumnos', 'cursos'];
  protected vistaActual: Vista = 'resumen';

  protected role: UserRole = 'ALUMNO';
  protected currentUser: AuthUser | null = null;
  protected selectedAlumnoId: number | null = null;

  protected filtroCursoId: number | null = null;
  protected filtroAlumnoId: number | null = null;
  protected loading = true;
  protected errorMessage = '';
  protected selectedNotaId: number | null = null;
  protected selectedAsistenciaId: number | null = null;

  protected cursos: Curso[] = [];
  protected alumnos: Alumno[] = [];
  protected notas: Nota[] = [];
  protected asistencias: Asistencia[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly modal: ModalService,
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.role = user.role;
        this.loadData();
      },
      error: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    });
  }

  protected setVista(vista: Vista): void {
    this.vistaActual = vista;
  }

  protected applyFilters(): void {
    this.loadData();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected get canWrite(): boolean {
    return this.role === 'DOCENTE';
  }

  protected selectNota(id: number): void {
    this.selectedNotaId = id;
  }

  protected selectAsistencia(id: number): void {
    this.selectedAsistenciaId = id;
  }

  protected get alumnoActivo(): Alumno | undefined {
    return this.alumnos.find((a) => a.id === this.selectedAlumnoId);
  }

  protected get notasVisibles(): ReadonlyArray<Nota> {
    return this.notas;
  }

  protected get asistenciasVisibles(): ReadonlyArray<Asistencia> {
    return this.asistencias;
  }

  protected get alumnosVisibles(): ReadonlyArray<Alumno> {
    return this.alumnos;
  }

  protected get resumenStats(): { totalCursos: number; totalAlumnos: number; totalNotas: number; totalAsistencias: number } {
    return {
      totalCursos: this.cursos.length,
      totalAlumnos: this.alumnosVisibles.length,
      totalNotas: this.notasVisibles.length,
      totalAsistencias: this.asistenciasVisibles.length,
    };
  }

  protected cursoNombre(cursoId: number): string {
    const curso = this.cursos.find((c) => c.id === cursoId);
    if (!curso) return 'Sin curso';
    return /^año\s+\d+$/i.test(curso.nombre.trim()) ? curso.nombre : `Año ${curso.id}`;
  }

  protected cursoLabel(curso: Curso): string {
    return this.cursoNombre(curso.id);
  }

  protected alumnoNombre(alumnoId: number): string {
    return this.alumnos.find((a) => a.id === alumnoId)?.nombre ?? 'Sin alumno';
  }

  protected descripcionNota(descripcion: string): string {
    return descripcion.replace(/^parcial/i, 'Examen');
  }

  protected fechaCorta(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    if (Number.isNaN(fecha.getTime())) return fechaIso;

    return fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  protected createNota(): void {
    if (!this.canWrite) return;

    const alumno = this.pickAlumnoForForm();
    if (!alumno) {
      this.errorMessage = 'No hay alumno disponible para crear nota';
      return;
    }

    const fields: FormField[] = [
      {
        name: 'valor',
        label: 'Valor (0-100)',
        type: 'number',
        value: 80,
        required: true,
        min: 0,
        max: 100,
      },
      {
        name: 'descripcion',
        label: 'Descripcion',
        type: 'text',
        value: 'Examen 1',
        required: true,
        placeholder: 'ej: Examen 1, Parcial, Tarea 1',
      },
      {
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        value: this.todayDate(),
        required: true,
      },
    ];

    this.modal
      .open({
        type: ModalType.NOTA_CREATE,
        title: 'Nueva Nota',
        fields,
        submitLabel: 'Crear',
      })
      .then((values) => {
        const payload: CreateNotaInput = {
          valor: Number(values['valor']),
          descripcion: values['descripcion'],
          fecha: values['fecha'],
          alumnoId: alumno.id,
          cursoId: alumno.cursoId,
        };

        this.api.createNota(payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo crear la nota';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected editSelectedNota(): void {
    if (!this.canWrite || !this.selectedNotaId) return;

    const nota = this.notas.find((n) => n.id === this.selectedNotaId);
    if (!nota) return;

    const fields: FormField[] = [
      {
        name: 'valor',
        label: 'Valor (0-100)',
        type: 'number',
        value: nota.valor,
        required: true,
        min: 0,
        max: 100,
      },
      {
        name: 'descripcion',
        label: 'Descripcion',
        type: 'text',
        value: nota.descripcion,
        required: true,
      },
      {
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        value: nota.fecha.slice(0, 10),
        required: true,
      },
    ];

    this.modal
      .open({
        type: ModalType.NOTA_EDIT,
        title: 'Editar Nota',
        fields,
        submitLabel: 'Actualizar',
      })
      .then((values) => {
        const payload: UpdateNotaInput = {
          valor: Number(values['valor']),
          descripcion: values['descripcion'],
          fecha: values['fecha'],
        };

        this.api.updateNota(nota.id, payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo editar la nota';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected deleteSelectedNota(): void {
    if (!this.canWrite || !this.selectedNotaId) return;
    const ok = window.confirm('Deseas eliminar la nota seleccionada?');
    if (!ok) return;

    this.api.deleteNota(this.selectedNotaId).subscribe({
      next: () => {
        this.selectedNotaId = null;
        this.loadData();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar la nota';
      },
    });
  }

  protected createAsistencia(): void {
    if (!this.canWrite) return;

    const alumno = this.pickAlumnoForForm();
    if (!alumno) {
      this.errorMessage = 'No hay alumno disponible para registrar asistencia';
      return;
    }

    const fields: FormField[] = [
      {
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        value: this.todayDate(),
        required: true,
      },
      {
        name: 'presente',
        label: 'Presente',
        type: 'checkbox',
        value: true,
      },
      {
        name: 'observacion',
        label: 'Observacion (opcional)',
        type: 'textarea',
        value: '',
        placeholder: 'Notas adicionales sobre la asistencia...',
      },
    ];

    this.modal
      .open({
        type: ModalType.ASISTENCIA_CREATE,
        title: 'Registrar Asistencia',
        fields,
        submitLabel: 'Registrar',
      })
      .then((values) => {
        const payload: CreateAsistenciaInput = {
          fecha: values['fecha'],
          presente: values['presente'] === true,
          observacion: values['observacion'] || undefined,
          alumnoId: alumno.id,
          cursoId: alumno.cursoId,
        };

        this.api.createAsistencia(payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo registrar la asistencia';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected editSelectedAsistencia(): void {
    if (!this.canWrite || !this.selectedAsistenciaId) return;

    const asistencia = this.asistencias.find((a) => a.id === this.selectedAsistenciaId);
    if (!asistencia) return;

    const fields: FormField[] = [
      {
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        value: asistencia.fecha.slice(0, 10),
        required: true,
      },
      {
        name: 'presente',
        label: 'Presente',
        type: 'checkbox',
        value: asistencia.presente,
      },
      {
        name: 'observacion',
        label: 'Observacion (opcional)',
        type: 'textarea',
        value: asistencia.observacion ?? '',
        placeholder: 'Notas adicionales sobre la asistencia...',
      },
    ];

    this.modal
      .open({
        type: ModalType.ASISTENCIA_EDIT,
        title: 'Editar Asistencia',
        fields,
        submitLabel: 'Actualizar',
      })
      .then((values) => {
        const payload: UpdateAsistenciaInput = {
          fecha: values['fecha'],
          presente: values['presente'] === true,
          observacion: values['observacion'] || undefined,
        };

        this.api.updateAsistencia(asistencia.id, payload).subscribe({
          next: () => this.loadData(),
          error: () => {
            this.errorMessage = 'No se pudo editar la asistencia';
          },
        });
      })
      .catch(() => {
        // Modal cancelled
      });
  }

  protected deleteSelectedAsistencia(): void {
    if (!this.canWrite || !this.selectedAsistenciaId) return;
    const ok = window.confirm('Deseas eliminar la asistencia seleccionada?');
    if (!ok) return;

    this.api.deleteAsistencia(this.selectedAsistenciaId).subscribe({
      next: () => {
        this.selectedAsistenciaId = null;
        this.loadData();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar la asistencia';
      },
    });
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private pickAlumnoForForm(): Alumno | undefined {
    if (this.filtroAlumnoId) {
      return this.alumnos.find((a) => a.id === this.filtroAlumnoId);
    }

    return this.alumnos[0];
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters = this.role === 'DOCENTE'
      ? { cursoId: this.filtroCursoId, alumnoId: this.filtroAlumnoId }
      : {};

    forkJoin({
      cursos: this.api.getCursos(),
      alumnos: this.api.getAlumnos(this.role === 'DOCENTE' ? this.filtroCursoId : null),
      notas: this.api.getNotas(filters),
      asistencias: this.api.getAsistencias(filters),
    }).subscribe({
      next: (res) => {
        this.cursos = res.cursos;

        if (this.role === 'ALUMNO' && this.currentUser?.id) {
          const own = res.alumnos.find((a) => a.userId === this.currentUser?.id);
          this.selectedAlumnoId = own?.id ?? null;

          this.alumnos = own ? [own] : [];
          this.notas = this.selectedAlumnoId
            ? res.notas.filter((n) => n.alumnoId === this.selectedAlumnoId)
            : [];
          this.asistencias = this.selectedAlumnoId
            ? res.asistencias.filter((a) => a.alumnoId === this.selectedAlumnoId)
            : [];
        } else {
          this.alumnos = res.alumnos;
          this.notas = res.notas;
          this.asistencias = res.asistencias;
        }

        this.selectedNotaId = this.notas.some((n) => n.id === this.selectedNotaId)
          ? this.selectedNotaId
          : null;
        this.selectedAsistenciaId = this.asistencias.some((a) => a.id === this.selectedAsistenciaId)
          ? this.selectedAsistenciaId
          : null;

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudieron cargar los datos. Verifica API y sesion.';
      },
    });
  }
}
