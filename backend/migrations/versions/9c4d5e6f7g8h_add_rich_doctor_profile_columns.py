"""add rich doctor profile columns

Revision ID: 9c4d5e6f7g8h
Revises: 8b3c4d5e6f7a
Create Date: 2026-02-19 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9c4d5e6f7g8h'
down_revision = '8b3c4d5e6f7a'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('doctors', sa.Column('qualification', sa.String(200)))
    op.add_column('doctors', sa.Column('experience', sa.Integer(), server_default='0'))
    op.add_column('doctors', sa.Column('fee', sa.Integer(), server_default='0'))
    op.add_column('doctors', sa.Column('available', sa.Boolean(), server_default='true'))
    op.add_column('doctors', sa.Column('department', sa.String(80)))
    op.add_column('doctors', sa.Column('bio', sa.Text()))
    op.add_column('doctors', sa.Column('timings', sa.String(120)))
    op.add_column('doctors', sa.Column('languages', sa.Text()))
    op.add_column('doctors', sa.Column('rating', sa.Float(), server_default='0'))
    op.add_column('doctors', sa.Column('successful_patients', sa.Integer(), server_default='0'))


def downgrade():
    op.drop_column('doctors', 'successful_patients')
    op.drop_column('doctors', 'rating')
    op.drop_column('doctors', 'languages')
    op.drop_column('doctors', 'timings')
    op.drop_column('doctors', 'bio')
    op.drop_column('doctors', 'department')
    op.drop_column('doctors', 'available')
    op.drop_column('doctors', 'fee')
    op.drop_column('doctors', 'experience')
    op.drop_column('doctors', 'qualification')
