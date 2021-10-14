import fetch from "../util/fetch-fill"
import URI from "urijs"

// /records endpoint
window.path = "http://localhost:3000/records"

// map of primary colors
const PRIMARY_COLORS = {
  red: true,
  blue: true,
  yellow: true
}   

// helper func to transform the data to the desired output
function transform (data, currPage) {
  let output = {},
      ids = [],
      maxRecords = 500
      open = []
    
  // initialize count of "closed" primary color records
  let closedPrimaryCount = 0

  // use .map() to get IDs but also build all result fields with a single iteration of the data to save on compute time
  ids = data.map(item => {
    // determine if item is a primary color
    let isPrimary = PRIMARY_COLORS[item.color] ? true : false
    
    // if item is "open", add new isPrimary key/value and push it to the open[] array
    if (item.disposition === 'open') {
      item.isPrimary = isPrimary
      open.push(item)
    }
    
    // increment closedPrimaryCount
    if (isPrimary && item.disposition === 'closed') closedPrimaryCount++

    return item.id
  })

  // build output
  output.ids = ids
  output.open = open
  output.closedPrimaryCount = closedPrimaryCount
  output.previousPage = currPage > 1 ? currPage -1 : null
  output.nextPage = (ids.length === 10 && currPage !== 50) ? currPage + 1 : null

  // return transformed data
  return output
}

// async functions always returns a promise, which is expected per the homework assignment
const retrieve = async function (params) {
  // default to page 1 if value is not passed in
  let page = (params && params.page) ? params.page : 1

  // hard code number of results per the assignment
  let limit = 10

  // calculate the offset
  let offset = (page - 1) * limit

  // build the URL using URIjs per the assignment
  let url = URI(path)
    .addSearch("limit", limit)
    .addSearch("offset", offset)
    .addSearch("color[]", (params && params.colors) ? params.colors : [])
  
  // fetch response
  let response = await fetch(url.toString())

  // error handling, log message and return empty object
  if (response.status !== 200) {
    console.log("An error occured, returning empty object")
    return {}
  }

  // resolve/parse the response to JSON
  let data = await response.json()

  // transform the data
  let transformedData = transform(data, page)

  // return the data.  this being an async function wraps the return in a Promise<>
  return transformedData

}

export default retrieve
