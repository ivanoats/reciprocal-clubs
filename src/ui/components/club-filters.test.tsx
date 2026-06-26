import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ClubFilters } from './club-filters'

const regions = ['Northern Inland Waters', 'Puget Sound North', 'Puget Sound South']

afterEach(() => {
  cleanup()
})

describe('ClubFilters', () => {
  it('renders the search input and region select', () => {
    render(<ClubFilters regions={regions} />)

    expect(screen.getByPlaceholderText('Search by club, region, or address')).not.toBeNull()
    expect(screen.getByRole('combobox')).not.toBeNull()
  })

  it('pre-fills the search input with the query prop', () => {
    render(<ClubFilters query="anacortes" regions={regions} />)

    expect(screen.getByDisplayValue('anacortes')).not.toBeNull()
  })

  it('pre-selects the selectedRegion in the dropdown', () => {
    render(<ClubFilters regions={regions} selectedRegion="Puget Sound South" />)

    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('Puget Sound South')
  })

  it('auto-submits the form when the region select changes', () => {
    render(<ClubFilters regions={regions} />)

    const select = screen.getByRole('combobox')
    const form = select.closest('form') as HTMLFormElement
    const requestSubmit = vi.fn()
    form.requestSubmit = requestSubmit

    fireEvent.change(select, { target: { value: 'Puget Sound North' } })

    expect(requestSubmit).toHaveBeenCalledTimes(1)
  })
})
