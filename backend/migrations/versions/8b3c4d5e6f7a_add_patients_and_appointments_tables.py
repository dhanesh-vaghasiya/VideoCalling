"""add patients and appointments tables

Revision ID: 8b3c4d5e6f7a
Revises: 7a2b3c4d5e6f
Create Date: 2026-02-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8b3c4d5e6f7a'
down_revision = '7a2b3c4d5e6f'
branch_labels = None
depends_on = None


def upgrade():
    # ── Patients table ──
    op.create_table(
        'patients',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('full_name', sa.String(120), nullable=False),
        sa.Column('relation', sa.String(40), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(10), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # ── Appointments table ──
    op.create_table(
        'appointments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('doctor_id', sa.Integer(), sa.ForeignKey('doctors.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('consultation_type', sa.String(40), nullable=False),
        sa.Column('symptoms', sa.Text()),
        sa.Column('date', sa.String(20), nullable=False),
        sa.Column('time', sa.String(10), nullable=False),
        sa.Column('mobile', sa.String(20)),
        sa.Column('status', sa.String(20), nullable=False, server_default='Pending'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table('appointments')
    op.drop_table('patients')
