package expr

import (
	"fmt"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/influxdb/influxdb/client"

	"bosun.org/_third_party/github.com/MiniProfiler/go/miniprofiler"
	"bosun.org/cmd/bosun/expr/parse"
	"bosun.org/opentsdb"
)

// Request holds query objects. Currently only absolute times are supported.
type idbRequest struct {
	Start *time.Time
	End   *time.Time
	Query string
	URL   *url.URL
}

type IDBContext interface {
	URL() url.URL
}

type iContext url.URL

func (self iContext) URL() url.URL {
	return url.URL(self)
}
func NewIDBContext(u url.URL) iContext {
	return iContext(u)
}

func InfluxDBQuery(e *State, T miniprofiler.Timer, query string, sduration, eduration, format string) (r *Results, err error) {
	fmt.Printf("Starting InfluxDBQuery: \n\tState: %v\n\tQuery: %#v\n", e, query)
	sd, err := opentsdb.ParseDuration(sduration)
	if err != nil {
		return
	}
	ed := opentsdb.Duration(0)
	if eduration != "" {
		ed, err = opentsdb.ParseDuration(eduration)
		if err != nil {
			return
		}
	}
	st := e.now.Add(-time.Duration(sd))
	et := e.now.Add(-time.Duration(ed))
	req := &idbRequest{
		Query: query,
		Start: &st,
		End:   &et,
	}
	r, err = timeInfluxDBRequest(e, T, req)
	if err != nil {
		return nil, err
	}
	// formatTags := strings.Split(format, ".")
	return
}

func influxDBTagQuery(args []parse.Node) (parse.Tags, error) {
	log.Printf("Starting influxDBTagQuery: %v\n", args)
	t := make(parse.Tags)
	n := args[3].(*parse.StringNode)
	for _, s := range strings.Split(n.Text, ".") {
		if s != "" {
			t[s] = struct{}{}
		}
	}
	log.Printf("Returning tags: %v\n", t)
	return t, nil
}

func timeInfluxDBRequest(e *State, T miniprofiler.Timer, req *idbRequest) (resp *Results, err error) {
	// e.graphiteQueries = append(e.graphiteQueries, *req)
	// b, _ := json.MarshalIndent(req, "", "  ")
	T.StepCustomTiming("influxDB", "query", "value here", func() {
		resp = &Results{}
		connection, _ := client.NewClient(client.Config{URL: e.influxDBContext.URL()})
		q := client.Query{
			Command:  req.Query,
			Database: "dewey",
		}
		response, err := connection.Query(q)
		if err != nil {
			log.Printf("Error querying InfluxDB: %v", err)
			return
		}

		log.Printf("Respones from Influx:\n")
		log.Printf("\tResults: %v\n", len(response.Results))

		// Loop over the responses...
		// results := make([]*Result, 0)
		for _, result := range response.Results {
			// tags := make(opentsdb.TagSet)
			log.Printf("\t\tResult had %v Series/Rows\n", len(result.Series))
			for _, row := range result.Series {
				log.Printf("Name: %v\n", row.Name)
				log.Printf("Tags: %v\n", row.Tags)
				log.Printf("Columns: %v\n", row.Columns)
				log.Printf("Data: %v\n", row.Values)
			}
		}
		// key := req.CacheKey()
		// getFn := func() (interface{}, error) {
		// 	return e.influxDBContext.Query(req)
		// }
		// var val interface{}
		// val, err = e.cache.Get(key, getFn)
		// // resp = val.(idbResponse)
	})
	return
}
