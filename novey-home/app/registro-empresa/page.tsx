'use client';

import { useRouter } from 'next/navigation';
import AuthShell, { TextField, SelectField, RadioGroup } from '../../components/auth/AuthShell';

// Registro de cuenta empresarial — Figma "Desktop - Cuenta empresa" (5579:3613)
export default function RegistroEmpresaPage() {
  const router = useRouter();
  return (
    <AuthShell active="empresa">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/');
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <h2 className="text-[22px] font-bold leading-7 text-text-primary">
            Crear una cuenta empresarial
          </h2>
          <p className="mt-1 text-[12px] leading-4 text-text-secondary">
            Los campos marcados con (*) son obligatorios.
          </p>
        </div>

        <TextField placeholder="Nombre de la empresa*" />

        <RadioGroup
          name="Tipo de identificación fiscal"
          options={['RUC', 'Cédula Tributaria', 'NT', 'NT Gobierno']}
          defaultValue="RUC"
        />
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <TextField placeholder="Ej: x-xxx-xxxxxxxx" />
          <TextField placeholder="DV*" />
        </div>

        <SelectField
          placeholder="Tipo de negocio*"
          options={['Construcción', 'Ferretería', 'Servicios', 'Comercio', 'Industria', 'Otro']}
        />
        <TextField placeholder="Correo electrónico de la empresa*" type="email" />

        <RadioGroup name="Tipo de teléfono de la empresa" options={['Fijo', 'Celular']} defaultValue="Fijo" />
        <TextField placeholder="Número de teléfono*" />
        <TextField placeholder="Dirección de la empresa*" />

        <SelectField placeholder="Panamá" options={['Panamá']} />
        <SelectField
          placeholder="Provincia*"
          options={[
            'Panamá',
            'Panamá Oeste',
            'Colón',
            'Coclé',
            'Chiriquí',
            'Veraguas',
            'Herrera',
            'Los Santos',
            'Bocas del Toro',
            'Darién',
          ]}
        />
        <TextField placeholder="Ciudad*" />

        <h3 className="mt-2 text-[15px] font-bold leading-5 text-text-primary">
          Administrador de la empresa
        </h3>
        <TextField placeholder="Nombre*" />
        <TextField placeholder="Apellidos*" />
        <SelectField placeholder="Género*" options={['Femenino', 'Masculino', 'Prefiero no decirlo']} />
        <RadioGroup
          name="Tipo de teléfono del administrador"
          options={['Fijo', 'Celular', 'Oficina']}
          defaultValue="Fijo"
        />
        <TextField placeholder="Número de teléfono" />
        <TextField placeholder="Correo electrónico*" type="email" />

        <button
          type="submit"
          className="mt-1 w-full rounded-novey bg-novey-blue px-6 py-3 text-[14px] font-semibold leading-5 text-white transition-colors duration-150 hover:bg-novey-blue-dark active:bg-novey-navy sm:w-[160px]"
        >
          Crear cuenta
        </button>
      </form>
    </AuthShell>
  );
}
