"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-07-24 21:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'gallery',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('imageUrl', sa.String(length=500), nullable=False),
    )
    
    op.create_table(
        'video',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('thumbnail', sa.String(length=500), nullable=False),
        sa.Column('videoUrl', sa.String(length=500), nullable=False),
    )

    op.create_table(
        'tower',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False),
    )

    op.create_table(
        'unit',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('towerId', sa.Integer(), sa.ForeignKey('tower.id'), nullable=False),
        sa.Column('number', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='AVAILABLE'),
    )

    op.create_table(
        'booking',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('unitId', sa.Integer(), sa.ForeignKey('unit.id'), nullable=False),
        sa.Column('customerName', sa.String(length=150), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=False),
        sa.Column('bookedAt', sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('booking')
    op.drop_table('unit')
    op.drop_table('tower')
    op.drop_table('video')
    op.drop_table('gallery')
