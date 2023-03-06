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
        fieldUrlAlias
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
            vignette
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
