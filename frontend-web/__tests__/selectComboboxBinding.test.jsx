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
  test('Select ignores dataObj/dataKey and does not forward them to DOM', () => {
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

    const trigger = screen.getByRole('button')
    expect(trigger).not.toHaveAttribute('dataobj')
    expect(trigger).not.toHaveAttribute('datakey')
  })

  test('Select synchronises with EasyList selected flags (single select)', async () => {
    let bound = null
    const Harness = ({ onReady }) => {
      const jobs = EasyList(
        JobsFixture.map((item) => ({
          ...item,
          selected: item.id === 'developer',
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

    const trigger = screen.getByRole('button', { name: '개발자' })
    fireEvent.click(trigger)

    const optionPm = screen.getByRole('option', { name: '프로덕트 매니저' })
    fireEvent.click(optionPm)

    await waitFor(() => expect(trigger).toHaveTextContent('프로덕트 매니저'))

    const selectedIds = []
    bound.jobs.forAll((item) => {
      if (item.selected) selectedIds.push(item.id)
    })
    expect(selectedIds).toEqual(['pm'])
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

    const trigger = screen.getByRole('button', { name: '개발자' })
    fireEvent.click(trigger)

    const optionPm = screen.getByRole('option', { name: '프로덕트 매니저' })
    fireEvent.click(optionPm)

    expect(screen.getByTestId('role-output')).toHaveTextContent('pm')
  })

  test('Combobox multi-select synchronises with EasyObj array', async () => {
    let exposed = null
    const Harness = ({ onReady }) => {
      const store = EasyObj({ filters: { tags: ['seoul'] } })
      const cities = EasyList([
        { value: 'seoul', text: '서울' },
        { value: 'busan', text: '부산' },
        { value: 'incheon', text: '인천' },
      ])
      useEffect(() => {
        onReady?.({ store, cities })
      }, [store, cities, onReady])
      return (
        <Combobox
          dataList={cities}
          dataObj={store.filters}
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
    expect(exposed.store.filters.tags).toEqual(
      expect.arrayContaining(['seoul', 'busan']),
    )

    await act(async () => {
      exposed.store.filters.set('tags', ['incheon'])
    })

    await waitFor(() =>
      expect(button).toHaveTextContent('인천'),
    )
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
