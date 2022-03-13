import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import { useTable, useFilters, useGlobalFilter,useAsyncDebounce,useRowSelect} from 'react-table'
// A great library for fuzzy filtering/sorting items
import {matchSorter} from 'match-sorter'
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import {FaTrashIt} from "react-icons/fa";
import {FaUserAlt} from "react-icons/fa";
import {FaEdit} from "react-icons/fa"
import { Checkbox } from './Checkbox';

// import makeData from './makeData'




const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`



function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search3 ${count} records...`}
    />
  )
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val

// Our table component
function Table({ columns, data }) {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn, // Be sure to pass the defaultColumn option
      filterTypes,
    },
    
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <Checkbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => <Checkbox {...row.getToggleRowSelectedProps()} />
        },
        ...columns
      ])
    },
    useFilters, // useFilters!
    useGlobalFilter, // useGlobalFilter!
    useRowSelect
  )

  // We don't want to render all of the rows for this example, so cap
  // it for this use case
  const firstPageRows = rows.slice(0, 20)

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                  {/* Render the columns filter UI */}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
          
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <br />
      <div>Showing the first 20 results of {rows.length} rows</div>
      <div>
        <pre>
          <code>{JSON.stringify(state.filters, null, 2)}</code>
        </pre>
      </div>
    </>
  )
}



function App() {

  const [data, setData] = useState([])

  function fetchdata() {
    axios.get('https://jsonplaceholder.typicode.com/users').then(res => {setData(res.data)})
  }

  useEffect(()=>fetchdata(),[])
  

  const columns = React.useMemo(
    () => [
      // {
      //   Header: 'Select',
      //   accessor: 'checkbox', // accessor is the "key" in the data
      //   disableFilters:true,
      //   Cell: row => {
      //     return(
      //       <div style={{'textAlign':'center'}}>
      //         <input type="checkbox" 
      //           defaultChecked={row.value === "Yes" ? true : false} onClick={()=>console.log(row)}  />
      //       </div>)}
      // },
      {
        Header: 'First Name',
        accessor: 'name' // accessor is the "key" in the data
      },
      {
        Header: 'Last Name',
            accessor: 'username',
            // Use our custom `fuzzyText` filter on this column
            filter: 'fuzzyText',
      },
      {
      Header: 'Email',
      accessor: 'email',
            // Use our custom `fuzzyText` filter on this column
            
      },

      {
        Header: 'Action',
        accessor: 'actions',// Use our custom `fuzzyText` filter on this column
        disableFilters:true,
        Cell: ({row}) =>{
          return(
            <div>
              <Button onClick={()=>console.log(row)}>{FaUserAlt}</Button>
              <Button onClick={()=>console.log(row.id)}>{FaEdit}</Button>
            </div>
          )
        }

        
      
              
        },
      
    ],
    []
)
  

  
  const udata = React.useMemo(() => data, [data])
  

  return (
    
    <Styles>
      <Table columns={columns} data={udata} />
    </Styles>
    
  )
}

export default App