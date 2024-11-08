package PackagePlaceHolder.demo.models;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class Page<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;

    public static <T> Page<T> of(List<T> content, PageRequest pageRequest, long totalElements) {
        return Page.<T>builder()
                .content(content)
                .pageNumber(pageRequest.getPage())
                .pageSize(pageRequest.getSize())
                .totalElements(totalElements)
                .totalPages((int) Math.ceil((double) totalElements / pageRequest.getSize()))
                .build();
    }
}
