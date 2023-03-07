export function getPaintingQuery(uuid: string) {
	return `
{
  nodeQuery(
    filter: {conditions: [{field: "uuid", value: "${uuid}"}]}
  ) {
    entities {
      entityUuid
      ... on NodeOeuvre {
        title
        absolutePath
        fieldOeuvreAuteurs {
          entity {
            fieldAuteurAuteur {
              entity {
                name
              }
            }
          }
        }
        fieldVisuels {
          entity {
            name
            publicUrl
          }
        }
        fieldMusee {
          entity {
            name
          }
        }
      }
    }
  }
}
`
}
