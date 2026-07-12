import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import Select from '@/app/lib/component/Select'
import Combobox from '@/app/lib/component/Combobox'
import EasyObj from '@/app/lib/dataset/EasyObj'
import EasyList from '@/app/lib/dataset/EasyList'
import React, { useEffect, useState } from 'react'

const JobsFixture = [
  { id: '', label: '선택하세요', placeholder: true },
  { id: 'designer', label: '디자이너' },
  { id: 'developer', label: '개발자' },
  { id: 'pm', label: '프로덕트 매니저' },
]

describe('Select & Combobox binding contracts', () => {
  test('Select supports dataObj/dataKey and does not forward them to DOM', () => {
    const form = { profile: { job: 'developer' } }
    const jobs = JobsFixture
    render(
      <Select
        dataObj={form.profile}
        dataKey="job"
        dataList={jobs}
        valueKey="id"
        textKey="label"
      />,
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('developer')
    expect(select).not.toHaveAttribute('dataobj')
    expect(select).not.toHaveAttribute('datakey')
  })

  test('Select synchronises with EasyList selected flags (single select)', async () => {
    let bound = null
    const Harness = ({ onReady }) => {
      const jobs = EasyList(
        JobsFixture.map((jobFixtureObj) => ({
          ...jobFixtureObj,
          selected: jobFixtureObj.id === 'developer',
        })),
      )
      useEffect(() => {
        onReady?.({ jobs })
      }, [jobs, onReady])
      return (
        <Select
          dataList={jobs}
          valueKey="id"
          textKey="label"
          status="success"
        />
      )
    }

    render(<Harness onReady={(exposed) => { bound = exposed }} />)
    await waitFor(() => expect(bound).not.toBeNull())

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'pm' } })
    await waitFor(() => expect(select).toHaveValue('pm'))

    const selectedIds = []
    bound.jobs.forAll((jobItemObj) => {
      if (jobItemObj.selected) selectedIds.push(jobItemObj.id)
    })
    expect(selectedIds).toEqual(['pm'])
  })

  test('Select reacts to external EasyObj bound value updates', async () => {
    let exposed = null
    const Harness = ({ onReady }) => {
      const filterStoreObj = EasyObj({ filters: { job: 'developer' } })
      const jobs = EasyList(JobsFixture)
      useEffect(() => {
        onReady?.({ filterStoreObj })
      }, [filterStoreObj, onReady])
      return (
        <Select
          dataObj={filterStoreObj.filters}
          dataKey="job"
          dataList={jobs}
          valueKey="id"
          textKey="label"
        />
      )
    }

    render(<Harness onReady={(value) => { exposed = value }} />)

    await waitFor(() => expect(exposed).not.toBeNull())

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('developer')

    await act(async () => {
      exposed.filterStoreObj.filters.job = 'pm'
    })

    await waitFor(() => {
      expect(select).toHaveValue('pm')
    })
  })

  test('Select controlled mode uses value/onValueChange contract', () => {
    const Controlled = () => {
      const [role, setRole] = useState('developer')
      const jobs = EasyList(JobsFixture)
      return (
        <>
          <Select
            dataList={jobs}
            valueKey="id"
            textKey="label"
            value={role}
            onValueChange={setRole}
            status="info"
          />
          <output data-testid="role-output">{role}</output>
        </>
      )
    }
    render(<Controlled />)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'pm' } })

    expect(screen.getByTestId('role-output')).toHaveTextContent('pm')
  })

  test('Combobox multi-select synchronises with EasyObj array', async () => {
    let exposed = null
    const Harness = ({ onReady }) => {
      const filterStoreObj = EasyObj({ filters: { tags: ['seoul'] } })
      const cities = EasyList([
        { value: 'seoul', text: '서울' },
        { value: 'busan', text: '부산' },
        { value: 'incheon', text: '인천' },
      ])
      useEffect(() => {
        onReady?.({ filterStoreObj, cities })
      }, [filterStoreObj, cities, onReady])
      return (
        <Combobox
          dataList={cities}
          dataObj={filterStoreObj.filters}
          dataKey="tags"
          multi
          placeholder="도시 선택"
          status="warning"
        />
      )
    }

    render(<Harness onReady={(value) => { exposed = value }} />)

    await waitFor(() => expect(exposed).not.toBeNull())

    const button = screen.getByRole('button', { name: /서울/ })
    fireEvent.click(button)

    const busanOption = screen.getByRole('option', { name: '부산' })
    fireEvent.click(busanOption)
    expect(exposed.filterStoreObj.filters.tags).toEqual(
      expect.arrayContaining(['seoul', 'busan']),
    )

    await act(async () => {
      exposed.filterStoreObj.filters.set('tags', ['incheon'])
    })

    await waitFor(() =>
      expect(button).toHaveTextContent('인천'),
    )
  })

  test('Combobox navigates and selects enabled options from the focused search input', () => {
    const handleValueChange = vi.fn()
    render(
      <Combobox
        dataList={[
          { value: 'disabled', text: '선택 불가', disabled: true },
          { value: 'seoul', text: '서울' },
          { value: 'busan', text: '부산' },
        ]}
        onValueChange={handleValueChange}
        placeholder="도시 선택"
      />,
    )

    const triggerButton = screen.getByRole('button', { name: /도시 선택/ })
    fireEvent.click(triggerButton)
    const searchInput = screen.getByRole('combobox')
    const seoulOption = screen.getByRole('option', { name: '서울' })
    expect(searchInput).toHaveFocus()

    fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
    expect(searchInput).toHaveAttribute('aria-activedescendant', seoulOption.id)
    expect(seoulOption).toHaveClass('ring-zinc-300')

    fireEvent.keyDown(searchInput, { key: 'Enter' })
    expect(handleValueChange).toHaveBeenCalledWith('seoul', expect.any(Object))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(triggerButton).toHaveTextContent('서울')
    expect(triggerButton).toHaveFocus()
  })

  test('Combobox keeps multi-select open and restores trigger focus on Escape', () => {
    const handleValueChange = vi.fn()
    render(
      <Combobox
        dataList={[
          { value: 'seoul', text: '서울' },
          { value: 'busan', text: '부산' },
        ]}
        multi
        onValueChange={handleValueChange}
        placeholder="도시 선택"
      />,
    )

    const triggerButton = screen.getByRole('button', { name: /도시 선택/ })
    fireEvent.click(triggerButton)
    const searchInput = screen.getByRole('combobox')
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
    fireEvent.keyDown(searchInput, { key: 'Enter' })

    expect(handleValueChange).toHaveBeenCalledWith(['seoul'], expect.any(Object))
    expect(screen.getByRole('option', { name: '서울' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(searchInput).toHaveFocus()

    fireEvent.keyDown(searchInput, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(triggerButton).toHaveFocus()
  })

  test('Combobox blocks interaction while loading', () => {
    render(
      <Combobox
        dataList={[{ value: 'seoul', text: '서울' }]}
        status="loading"
      />,
    )
    const triggerButton = screen.getByRole('button')
    expect(triggerButton).toBeDisabled()
    fireEvent.click(triggerButton)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  test('Select and Combobox preserve explicit loading status while disabled', () => {
    render(
      <>
        <Select
          dataList={[{ value: 'seoul', text: '서울' }]}
          status="loading"
          disabled
        />
        <Combobox
          dataList={[{ value: 'seoul', text: '서울' }]}
          status="loading"
          disabled
        />
      </>,
    )

    const select = screen.getByRole('combobox')
    const comboboxTrigger = screen.getByRole('button')
    expect(select).toBeDisabled()
    expect(select).toHaveAttribute('aria-busy', 'true')
    expect(comboboxTrigger).toBeDisabled()
    expect(comboboxTrigger).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByText('불러오는 중…')).toHaveLength(2)
  })

  test('Combobox remains non-interactive for disabled default status', () => {
    render(
      <Combobox
        dataList={[{ value: 'seoul', text: '서울' }]}
        disabled
      />,
    )

    const triggerButton = screen.getByRole('button')
    expect(triggerButton).toBeDisabled()
    expect(triggerButton).not.toHaveAttribute('aria-busy')
    fireEvent.click(triggerButton)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  test.each([
    ['disabled', { disabled: true }],
    ['loading', { status: 'loading' }],
  ])('Combobox closes an open multi popup after a %s transition without mutating selection', (_label, transitionProps) => {
    const handleValueChange = vi.fn()
    const cityList = [
      { value: 'seoul', text: '서울' },
      { value: 'busan', text: '부산' },
    ]
    const comboElement = (props = {}) => (
      <Combobox
        dataList={cityList}
        defaultValue={['seoul']}
        multi
        showSelectAll
        onValueChange={handleValueChange}
        {...props}
      />
    )
    const { rerender } = render(comboElement())
    const triggerButton = screen.getByRole('button', { name: /서울/ })

    fireEvent.click(triggerButton)
    const selectAllButton = screen.getByRole('button', { name: '전체' })
    const busanOption = screen.getByRole('option', { name: '부산' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    rerender(comboElement(transitionProps))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(triggerButton).toBeDisabled()
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(selectAllButton)
    fireEvent.click(busanOption)
    expect(handleValueChange).not.toHaveBeenCalled()

    rerender(comboElement())
    const enabledTriggerButton = screen.getByRole('button', { name: /서울/ })
    expect(enabledTriggerButton).not.toBeDisabled()
    fireEvent.click(enabledTriggerButton)
    expect(screen.getByRole('option', { name: '서울' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: '부산' })).toHaveAttribute('aria-selected', 'false')
  })

  test('Select empty status surface default message with assertive aria-live', () => {
    render(
      <Select
        dataList={[]}
        status="empty"
      />,
    )
    const message = screen.getByText('표시할 항목이 없습니다.')
    expect(message).toBeVisible()
    expect(message).toHaveAttribute('aria-live', 'assertive')
  })

  test('Combobox empty status surfaces default message with assertive aria-live', () => {
    render(
      <Combobox
        dataList={[]}
        status="empty"
      />,
    )
    const message = screen.getByText('표시할 항목이 없습니다.')
    expect(message).toBeVisible()
    expect(message).toHaveAttribute('aria-live', 'assertive')
  })
})
