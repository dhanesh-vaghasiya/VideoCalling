"""split users into users and doctors tables

Revision ID: 7a2b3c4d5e6f
Revises: 36e9f12a208a
Create Date: 2026-02-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7a2b3c4d5e6f'
down_revision = '36e9f12a208a'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the old combined users table (if it exists)
    op.execute("DROP TABLE IF EXISTS users CASCADE")

    # Create the new users table (patients/caretakers only)
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('full_name', sa.String(120), nullable=False),
        sa.Column('email', sa.String(120), unique=True, nullable=False),
        sa.Column('phone', sa.String(20), unique=True),
        sa.Column('password_hash', sa.String(256), nullable=False),
        sa.Column('address', sa.Text()),
        sa.Column('city', sa.String(80)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Create the new doctors table
    op.create_table(
        'doctors',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('full_name', sa.String(120), nullable=False),
        sa.Column('email', sa.String(120), unique=True, nullable=False),
        sa.Column('phone', sa.String(20), unique=True),
        sa.Column('password_hash', sa.String(256), nullable=False),
        sa.Column('specialization', sa.String(120)),
        sa.Column('license_number', sa.String(60)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table('doctors')
    op.drop_table('users')

    # Recreate the old combined users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('full_name', sa.String(120), nullable=False),
        sa.Column('email', sa.String(120), unique=True, nullable=False),
        sa.Column('phone', sa.String(20), unique=True),
        sa.Column('password_hash', sa.String(256), nullable=False),
        sa.Column('role', sa.String(20), nullable=False, server_default='user'),
        sa.Column('specialization', sa.String(120)),
        sa.Column('license_number', sa.String(60)),
        sa.Column('address', sa.Text()),
        sa.Column('city', sa.String(80)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
